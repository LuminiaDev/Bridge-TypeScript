import { BridgePacket } from '../bridge-packet';
import { BridgePacketSerializerHelper } from "./bridge-packet-serializer-helper";
import ByteBuffer from "bytebuffer";

export interface BridgePacketSerializer<T extends BridgePacket> {
    serialize(buffer: ByteBuffer, helper: BridgePacketSerializerHelper, packet: T): void;
    deserialize(buffer: ByteBuffer, helper: BridgePacketSerializerHelper, packet: T): void;
}