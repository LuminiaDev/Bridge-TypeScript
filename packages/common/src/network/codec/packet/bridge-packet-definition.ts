import { BridgePacket } from "./bridge-packet";
import { BridgePacketFactory } from "./bridge-packet-factory";
import { BridgePacketSerializer } from "./serializer";

export class BridgePacketDefinition<T extends BridgePacket> {
    constructor(
        public readonly id: string,
        public readonly factory: BridgePacketFactory<T>,
        public readonly serializer: BridgePacketSerializer<T>
    ) {}

    getId(): string {
        return this.id;
    }

    getFactory(): BridgePacketFactory<T> {
        return this.factory;
    }

    getSerializer(): BridgePacketSerializer<T> {
        return this.serializer;
    }
}