import {
    BridgePacket, BridgePacketDefinition, BridgePacketSerializer, BridgeUnknownPacket,
    BridgeUnknownPacketSerializer
} from './packet';
import { BridgeCodecBuilder } from './bridge-codec-builder';
import { BridgeCodecException } from "../../exception/bridge-codec-exception";
import ByteBuffer from "bytebuffer";

export class BridgeCodec {
    private readonly packetsById = new Map<string, BridgePacketDefinition<any>>();
    private readonly packetsByClass = new Map<new () => any, BridgePacketDefinition<any>>();

    static builder(): BridgeCodecBuilder {
        return new BridgeCodecBuilder();
    }

    getPacketDefinition(id: string): BridgePacketDefinition<any> | null;
    getPacketDefinition<T extends BridgePacket>(classOf: new () => T): BridgePacketDefinition<T> | null;
    getPacketDefinition<T extends BridgePacket>(
        idOrClass: string | (new () => T)
    ): BridgePacketDefinition<any> | null {
        if (typeof idOrClass === 'string') {
            return this.packetsById.get(idOrClass) || null;
        } else {
            return this.packetsByClass.get(idOrClass) || null;
        }
    }

    registerPacket<T extends BridgePacket>(definition: BridgePacketDefinition<T>): void {
        if (!this.packetsById.has(definition.getId())) {
            this.packetsById.set(definition.getId(), definition);
            this.packetsByClass.set(definition.getFactory().getPacketClass(), definition);
        } else {
            throw new BridgeCodecException(`Packet with id ${definition.getId()} is already registered`);
        }
    }

    unregisterPacket(packetId: string): void {
        const definition = this.packetsById.get(packetId);
        if (definition) {
            this.packetsById.delete(packetId);
            this.packetsByClass.delete(definition.getFactory().getPacketClass());
        } else {
            throw new BridgeCodecException(`Packet with id ${packetId} is not registered`);
        }
    }

    tryDecode(buffer: ByteBuffer, packetId: string): BridgePacket {
        const definition = this.getPacketDefinition(packetId);

        let packet: BridgePacket;
        let serializer: BridgePacketSerializer<any>;

        if (definition) {
            packet = definition.getFactory().create();
            serializer = definition.getSerializer();
        } else {
            const unknownPacket = new BridgeUnknownPacket();
            unknownPacket.setOriginalId(packetId);

            // Create a copy of the buffer for the unknown packet
            const remainingBytes = buffer.remaining();
            const payloadBytes = new Uint8Array(remainingBytes);
            const currentOffset = buffer.offset;
            for (let i = 0; i < remainingBytes; i++) {
                payloadBytes[i] = buffer.readUint8(currentOffset + i);
            }
            const payloadBuffer = new ByteBuffer(payloadBytes.length);
            payloadBuffer.append(payloadBytes);
            payloadBuffer.flip();
            unknownPacket.setOriginalPayload(payloadBuffer);

            packet = unknownPacket;
            serializer = new BridgeUnknownPacketSerializer();
        }

        serializer.deserialize(buffer, packet);
        return packet;
    }

    tryEncode<T extends BridgePacket>(buffer: ByteBuffer, packet: T): void {
        let serializer: BridgePacketSerializer<T>;

        if (packet instanceof BridgeUnknownPacket) {
            serializer = new BridgeUnknownPacketSerializer() as any;
        } else {
            const definition = this.getPacketDefinition(packet.getId());
            if (!definition) {
                throw new BridgeCodecException(`Definition for packet with id ${packet.getId()} not found`);
            }
            serializer = definition.getSerializer();
        }

        serializer.serialize(buffer, packet);
    }

    toBuilder(): BridgeCodecBuilder {
        const builder = new BridgeCodecBuilder();
        for (const [id, definition] of this.packetsById) {
            builder.registerPacket(definition);
        }
        return builder;
    }
}
