import { BridgeCodec, BridgePacketConstructor } from "./codec";
import { BridgePacket, BridgePacketHandler, BridgeSinglePacketHandler } from "./codec";

export interface BridgeNetwork {
    getServiceId(): string;
    setCodec(codec: BridgeCodec): void;
    getCodec(): BridgeCodec | null;
    getPacketHandlers(): ReadonlySet<BridgePacketHandler>;
    addPacketHandler(handler: BridgePacketHandler): BridgePacketHandler;
    addTypedPacketHandler<T extends BridgePacket>(
        packetType: BridgePacketConstructor<T>,
        handler: BridgeSinglePacketHandler<T>
    ): BridgePacketHandler;
    removePacketHandler(handler: BridgePacketHandler): void;
    sendPacket<T extends BridgePacket>(packet: T): void;
    tryDecode(buffer: ByteBuffer, packetId: string): BridgePacket;
    tryEncode<T extends BridgePacket>(buffer: ByteBuffer, packet: T): void;
    start(): void;
    close(): void;
}
