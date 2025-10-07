import { BridgePacket, BridgePacketConstructor, BridgePacketFactory } from "../network";

export function createPacketFactory<T extends BridgePacket>(
    PacketClass: BridgePacketConstructor<T>
): BridgePacketFactory<T> {
    return {
        create: () => new PacketClass(),
        getPacketClass: () => PacketClass
    };
}