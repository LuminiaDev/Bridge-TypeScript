export interface BridgePacket {
    getId(): string;
}

export type BridgePacketConstructor<T extends BridgePacket> = new (...args: any[]) => T;