import { BridgeCodec } from "./codec/bridge-codec";
import { BridgePacket, BridgePacketHandler } from "./codec/packet";

export interface BridgeNetwork {
    getServiceId(): string;
    setCodec(codec: BridgeCodec): void;
    getCodec(): BridgeCodec | null;
    getPacketHandlers(): ReadonlySet<BridgePacketHandler>;
    addPacketHandler(handler: BridgePacketHandler): void;
    removePacketHandler(handler: BridgePacketHandler): void;
    sendPacket<T extends BridgePacket>(packet: T): void;
    tryDecode(buffer: ByteBuffer, packetId: string): BridgePacket;
    tryEncode<T extends BridgePacket>(buffer: ByteBuffer, packet: T): void;
    start(): void;
    close(): void;
}
