import { BridgePacket, BridgePacketFactory } from "../network/codec/packet";

export function createPacketFactory<T extends BridgePacket>(
    PacketClass: new () => T
): BridgePacketFactory<T> {
    return {
        create: () => new PacketClass(),
        getPacketClass: () => PacketClass
    };
}