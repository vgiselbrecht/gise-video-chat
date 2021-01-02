import { IExchange } from "../Exchange/IExchange";
import { Devices } from "../Elements/Devices.js";
import { Textchat } from "../Elements/Textchat.js";
import { Videogrid } from "../Elements/Videogrid";
import { Video } from "../Elements/Video";
import { PartnerListElement } from "../Elements/PartnerListElement";

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
    videoGridElement: Video;
    partnerListElement: PartnerListElement;
    stream: any;
    onConnectedEvent: (partner: IPartner) => void;
    onConnectionClosedEvent: (partner: IPartner) => void;
    onConnectionLosedEvent: (partner: IPartner) => void;
    getName(): string;
    setName(name: string): void;
    setMuted(muted: boolean): void;
    setCameraOff(cameraOff: boolean);
    setScreenSharing(screenSharing: boolean);
    setListener(listener: boolean);
    createOffer(doLoop: boolean): void;
    createAnswer(offer: any): void;
    addVideoElement(): void;
    closeConnection(): void;
    reloadConnection(): void; 
    setSinkId(sinkId: any): void;
    sendMessage(message: any): void;
}