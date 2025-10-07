import { BridgePacket } from "./bridge-packet";
import { BridgePacketSerializer, BridgePacketSerializerHelper } from "./serializer";
import ByteBuffer from "bytebuffer";

export class BridgeUnknownPacket implements BridgePacket {
    private originalId?: string;
    private originalPayload?: ByteBuffer;

    getId(): string {
        return 'unknown';
    }

    getOriginalId(): string | undefined {
        return this.originalId;
    }

    setOriginalId(originalId: string): void {
        this.originalId = originalId;
    }

    getOriginalPayload(): ByteBuffer | undefined {
        return this.originalPayload;
    }

    setOriginalPayload(originalPayload: ByteBuffer): void {
        this.originalPayload = originalPayload;
    }
}

export class BridgeUnknownPacketSerializer implements BridgePacketSerializer<BridgeUnknownPacket> {
    serialize(buffer: ByteBuffer, helper: BridgePacketSerializerHelper, packet: BridgeUnknownPacket): void {
        const originalId = packet.getOriginalId() || '';
        buffer.writeVString(originalId);

        const originalPayload = packet.getOriginalPayload();
        if (originalPayload) {
            const remainingBytes = originalPayload.remaining();
            const bytes = new Uint8Array(remainingBytes);
            for (let i = 0; i < remainingBytes; i++) {
                bytes[i] = originalPayload.readUint8();
            }
            buffer.append(bytes);
        }
    }

    deserialize(buffer: ByteBuffer, helper: BridgePacketSerializerHelper, packet: BridgeUnknownPacket): void {
        packet.setOriginalId(buffer.readVString());

        const remaining = buffer.remaining();
        if (remaining > 0) {
            const payloadBytes = new Uint8Array(remaining);
            for (let i = 0; i < remaining; i++) {
                payloadBytes[i] = buffer.readUint8();
            }
            const payloadBuffer = new ByteBuffer(payloadBytes.length);
            payloadBuffer.append(payloadBytes);
            payloadBuffer.flip();
            packet.setOriginalPayload(payloadBuffer);
        }
    }
}