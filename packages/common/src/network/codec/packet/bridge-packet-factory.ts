import { BridgePacket, BridgePacketConstructor } from './bridge-packet';

export interface BridgePacketFactory<T extends BridgePacket> {
    create(): T;
    getPacketClass(): BridgePacketConstructor<T>;
}
