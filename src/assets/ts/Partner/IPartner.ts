import { IExchange } from "../Exchange/IExchange";
import { Devices } from "../Elements/Devices";
import { Textchat } from "../Elements/Textchat"; 
import { Videogrid } from "../Elements/Videogrid";
import { Video } from "../Elements/Video";
import { Controls } from "../Elements/Controls";
import { PartnerListElement } from "../Elements/PartnerListElement";

export interface IPartner{

    id: number;
    name: string;
    muted: boolean;
    cameraOff: boolean;
    screenSharing: boolean;
    listener: boolean;
    videoElement: HTMLElement;
    connection: RTCPeerConnection;
    exchange: IExchange;
    devices: Devices;
    textchat: Textchat;
    connected: boolean;
    checking: boolean;
    lastPing: Date;
    lastConnectionLost: Date;
    calls: number;
    videogrid: Videogrid;
    controls: Controls;
    videoGridElement: Video;
    partnerListElement: PartnerListElement;
    stream: any;
    gotTracks: boolean;
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
    callPartner(): void;
    hidePartnerElement(): void;
    showPartnerElement(): void;
    
}