import { IExchange } from "../Exchange/IExchange";
import { Devices } from "../Elements/Devices.js";
import { Textchat } from "../Elements/Textchat.js";

export interface IPartner{

    id: number;
    videoElement: HTMLElement;
    connection: RTCPeerConnection;
    exchange: IExchange;
    devices: Devices;
    textchat: Textchat;
    connected: boolean;
    offerLoop: any;
    getName(): string;
    setName(name: string): void;
    createOffer(): void;
    addVideoElement(): void;
    closeConnection(): void;
    setSinkId(sinkId: any): void;
    sendMessage(message: any): void;
}