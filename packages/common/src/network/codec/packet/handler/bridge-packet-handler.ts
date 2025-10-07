import { BridgePacket } from '../bridge-packet';
import { BridgePacketDirection } from '../bridge-packet-direction';

export type BridgePacketHandler = (
    packet: BridgePacket,
    direction: BridgePacketDirection,
    serviceId: string
) => void;
