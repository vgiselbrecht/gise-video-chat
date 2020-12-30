import { IExchange } from "../Exchange/IExchange";
import { Devices } from "../Elements/Devices.js";
import { Textchat } from "../Elements/Textchat.js";
import { Videogrid } from "../Elements/Videogrid";

export interface IPartner{

    id: number;
    videoElement: HTMLElement;
    connection: RTCPeerConnection;
    exchange: IExchange;
    devices: Devices;
    textchat: Textchat;
    connected: boolean;
    offerLoop: any;
    videogrid: Videogrid;
    setStreamToPartner: (partner: IPartner, initial: boolean) => void
    getName(): string;
    setName(name: string): void;
    createOffer(): void;
    createAnswer(offer: any): void;
    addVideoElement(): void;
    closeConnection(): void;
    reloadConnection(): void; 
    setSinkId(sinkId: any): void;
    sendMessage(message: any): void;
}