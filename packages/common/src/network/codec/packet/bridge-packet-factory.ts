import { BridgePacket } from './bridge-packet';

export interface BridgePacketFactory<T extends BridgePacket> {
    create(): T;
    getPacketClass(): new () => T;
}
