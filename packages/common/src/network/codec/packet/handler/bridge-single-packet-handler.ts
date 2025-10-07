import { BridgePacketDirection } from "../bridge-packet-direction";
import { BridgePacket, BridgePacketConstructor } from "../bridge-packet";
import { BridgePacketHandler } from "./bridge-packet-handler";

export type BridgeSinglePacketHandler<T extends BridgePacket> = (
    packet: T,
    direction: BridgePacketDirection,
    serviceId: string
) => void;

export class TypedBridgePacketHandler<T extends BridgePacket> {
    constructor(
        private readonly type: BridgePacketConstructor<T>,
        private readonly handler: BridgeSinglePacketHandler<T>
    ) {}

    handle(packet: BridgePacket, direction: BridgePacketDirection, serviceId: string): void {
        if (packet instanceof this.type) {
            this.handler(packet as T, direction, serviceId);
        }
    }

    asHandler(): BridgePacketHandler {
        return this.handle.bind(this);
    }
}
