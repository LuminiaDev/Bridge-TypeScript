import {
    AbstractBridgeNetwork,
    BridgePacket,
    BridgePacketDirection
} from '@luminiadev/bridge-common';
import { BridgeRabbitMQConfig } from './bridge-rabbitmq-config';
import { BridgeRabbitMQException } from '../exception/bridge-rabbitmq-exception';
import { connect, Channel, ConsumeMessage, ChannelModel } from 'amqplib';
import { v4 as uuidv4 } from 'uuid';
import ByteBuffer from "bytebuffer";

export class BridgeRabbitMQNetwork extends AbstractBridgeNetwork {
    public static readonly PACKET_SEND_EXCHANGE = 'lumibridge.packet_send_exchange';

    private readonly serviceId: string;
    private connection?: ChannelModel;
    private channel?: Channel;
    private queueName?: string;

    constructor(private readonly config: BridgeRabbitMQConfig) {
        super();
        this.serviceId = config.serviceId || uuidv4();
    }

    getServiceId(): string {
        return this.serviceId;
    }

    async start(): Promise<void> {
        try {
            const connectionUrl = this.buildConnectionUrl();
            this.connection = await connect(connectionUrl);
            this.channel = await this.connection.createChannel();

            await this.channel.assertExchange(
                BridgeRabbitMQNetwork.PACKET_SEND_EXCHANGE,
                'fanout',
                {durable: false}
            );

            const queueResult = await this.channel.assertQueue('', {exclusive: true});
            this.queueName = queueResult.queue;

            await this.channel.bindQueue(
                this.queueName,
                BridgeRabbitMQNetwork.PACKET_SEND_EXCHANGE,
                ''
            );

            await this.channel.consume(
                this.queueName,
                (message) => this.handleDelivery(message),
                {noAck: true}
            );
        } catch (error) {
            throw new BridgeRabbitMQException('Failed to start RabbitMQ network', error as Error);
        }
    }

    async close(): Promise<void> {
        try {
            if (this.queueName && this.channel) {
                await this.channel.unbindQueue(
                    this.queueName,
                    BridgeRabbitMQNetwork.PACKET_SEND_EXCHANGE,
                    ''
                );
                await this.channel.deleteQueue(this.queueName);
            }

            if (this.channel) {
                await this.channel.close();
            }

            if (this.connection) {
                await this.connection.close();
            }
        } catch (error) {
            throw new BridgeRabbitMQException('Failed to close RabbitMQ connection', error as Error);
        }
    }

    sendPacket<T extends BridgePacket>(packet: T): void {
        if (!this.channel) {
            throw new BridgeRabbitMQException('Network is not started');
        }
        try {
            const buffer = new ByteBuffer();
            buffer.writeVString(packet.getId());
            buffer.writeVString(this.serviceId);

            this.tryEncode(buffer, packet);
            for (const packetHandler of this.getPacketHandlers()) {
                packetHandler(packet, BridgePacketDirection.FROM_SERVICE, this.serviceId);
            }

            const bufferArray = new Uint8Array(buffer.flip().toArrayBuffer());
            this.channel.publish(
                BridgeRabbitMQNetwork.PACKET_SEND_EXCHANGE,
                '',
                Buffer.from(bufferArray)
            );
        } catch (error) {
            throw new BridgeRabbitMQException(
                `Failed to send packet: ${packet.getId()}`,
                error as Error
            );
        }
    }

    private handleDelivery(message: ConsumeMessage | null): void {
        if (!message) {
            return;
        }
        try {
            const buffer = new ByteBuffer();
            buffer.append(message.content);
            buffer.flip();

            const packetId = buffer.readVString();
            const senderId = buffer.readVString();

            if (senderId === this.serviceId) {
                return;
            }

            const packet = this.tryDecode(buffer, packetId);
            for (const packetHandler of this.getPacketHandlers()) {
                packetHandler(packet, BridgePacketDirection.TO_SERVICE, senderId);
            }
        } catch (error) {
            throw new BridgeRabbitMQException('Failed to handle delivery', error as Error);
        }
    }

    private buildConnectionUrl(): string {
        const {host, port, credentials, virtualHost} = this.config;
        const actualHost = !host ? 'localhost' : host;
        const actualPort = !port || port === -1 ? 5672 : port;
        const encodedVHost = encodeURIComponent(virtualHost || '/');
        return `amqp://${credentials.username}:${credentials.password}@${actualHost}:${actualPort}/${encodedVHost}`;
    }
}