import ByteBuffer from "bytebuffer";

export class BridgePacketSerializerHelper {
    constructor(private readonly buffer: ByteBuffer) {}

    readArray<T>(readerFunc: () => T): T[] {
        const length = this.readUnsignedVarInt();
        const array: T[] = [];

        for (let i = 0; i < length; i++) {
            array.push(readerFunc());
        }

        return array;
    }

    writeArray<T>(array: T[], writerFunc: (item: T) => void): void {
        this.writeUnsignedVarInt(array.length);

        for (const item of array) {
            writerFunc(item);
        }
    }

    writeUnsignedVarInt(value: number): void {
        while (value >= 0x80) {
            this.buffer.writeUint8((value & 0x7F) | 0x80);
            value >>>= 7;
        }
        this.buffer.writeUint8(value & 0x7F);
    }

    readUnsignedVarInt(): number {
        let value = 0;
        let shift = 0;
        let byte: number;

        do {
            byte = this.buffer.readUint8();
            value |= (byte & 0x7F) << shift;
            shift += 7;
        } while ((byte & 0x80) !== 0);

        return value;
    }

    writeVarInt(value: number): void {
        this.writeUnsignedVarInt((value << 1) ^ (value >> 31));
    }

    readVarInt(): number {
        const unsigned = this.readUnsignedVarInt();
        return (unsigned >>> 1) ^ -(unsigned & 1);
    }

    writeUnsignedVarLong(value: bigint): void {
        while (value >= 0x80n) {
            this.buffer.writeUint8(Number((value & 0x7Fn) | 0x80n));
            value >>= 7n;
        }
        this.buffer.writeUint8(Number(value & 0x7Fn));
    }

    readUnsignedVarLong(): bigint {
        let value = 0n;
        let shift = 0n;
        let byte: number;

        do {
            byte = this.buffer.readUint8();
            value |= BigInt(byte & 0x7F) << shift;
            shift += 7n;
        } while ((byte & 0x80) !== 0);

        return value;
    }

    writeVarLong(value: bigint): void {
        this.writeUnsignedVarLong((value << 1n) ^ (value >> 63n));
    }

    readVarLong(): bigint {
        const unsigned = this.readUnsignedVarLong();
        return (unsigned >> 1n) ^ -(unsigned & 1n);
    }
}
