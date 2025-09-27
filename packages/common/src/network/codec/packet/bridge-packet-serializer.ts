import { BridgePacket } from './bridge-packet';
import ByteBuffer from "bytebuffer";

export interface BridgePacketSerializer<T extends BridgePacket> {
    serialize(buffer: ByteBuffer, packet: T): void;
    deserialize(buffer: ByteBuffer, packet: T): void;
}