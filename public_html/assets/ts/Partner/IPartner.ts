import { IExchange } from "../Exchange/IExchange";

export interface IPartner{

    id: number;
    videoElement: HTMLElement;
    connection: RTCPeerConnection;
    exchange: IExchange;
    connected: boolean;
    offerLoop: any;
    createOffer(): void;
    addVideoElement(): void;
    closeConnection(): void;
}