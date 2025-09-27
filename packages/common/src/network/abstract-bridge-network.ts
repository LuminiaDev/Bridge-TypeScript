import { BridgeNetwork } from './bridge-network';
import { BridgePacket, BridgePacketHandler } from "./codec/packet";
import { BridgeCodec } from "./codec/bridge-codec";
import { BridgeCodecException } from '../exception/bridge-codec-exception';

export abstract class AbstractBridgeNetwork implements BridgeNetwork {
    private codec: BridgeCodec | null = null;
    private readonly handlers = new Set<BridgePacketHandler>();

    abstract getServiceId(): string;
    abstract sendPacket<T extends BridgePacket>(packet: T): void;
    abstract start(): void;
    abstract close(): void;

    setCodec(codec: BridgeCodec): void {
        this.codec = codec;
    }

    getCodec(): BridgeCodec | null {
        return this.codec;
    }

    getPacketHandlers(): ReadonlySet<BridgePacketHandler> {
        return new Set(this.handlers);
    }

    addPacketHandler(handler: BridgePacketHandler): void {
        this.handlers.add(handler);
    }

    removePacketHandler(handler: BridgePacketHandler): void {
        this.handlers.delete(handler);
    }

    tryDecode(buffer: ByteBuffer, packetId: string): BridgePacket {
        if (!this.codec) {
            throw new BridgeCodecException('Codec is not set');
        }
        return this.codec.tryDecode(buffer, packetId);
    }

    tryEncode<T extends BridgePacket>(buffer: ByteBuffer, packet: T): void {
        if (!this.codec) {
            throw new BridgeCodecException('Codec is not set');
        }
        this.codec.tryEncode(buffer, packet);
    }
}
