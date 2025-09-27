import { BridgePacket, BridgePacketDefinition, BridgePacketFactory, BridgePacketSerializer } from './packet';
import { BridgeCodec } from './bridge-codec';
import { BridgeCodecException } from "../../exception/bridge-codec-exception";

export class BridgeCodecBuilder {
    private readonly definitions = new Map<string, BridgePacketDefinition<any>>();

    registerPacket<T extends BridgePacket>(
        id: string,
        factory: BridgePacketFactory<T>,
        serializer: BridgePacketSerializer<T>
    ): BridgeCodecBuilder;
    registerPacket<T extends BridgePacket>(definition: BridgePacketDefinition<T>): BridgeCodecBuilder;
    registerPacket<T extends BridgePacket>(
        idOrDefinition: string | BridgePacketDefinition<T>,
        factory?: BridgePacketFactory<T>,
        serializer?: BridgePacketSerializer<T>
    ): BridgeCodecBuilder {
        let definition: BridgePacketDefinition<T>;

        if (typeof idOrDefinition === 'string') {
            if (!factory || !serializer) {
                throw new Error('Factory and serializer are required when registering with id');
            }
            definition = new BridgePacketDefinition(idOrDefinition, factory, serializer);
        } else {
            definition = idOrDefinition;
        }

        if (!this.definitions.has(definition.getId())) {
            this.definitions.set(definition.getId(), definition);
        } else {
            throw new BridgeCodecException(`Packet with id ${definition.getId()} is already registered`);
        }
        return this;
    }

    unregisterPacket(packetId: string): BridgeCodecBuilder {
        if (!this.definitions.delete(packetId)) {
            throw new BridgeCodecException(`Packet with id ${packetId} is not registered`);
        }
        return this;
    }

    build(): BridgeCodec {
        const codec = new BridgeCodec();
        for (const definition of this.definitions.values()) {
            codec.registerPacket(definition);
        }
        return codec;
    }
}
