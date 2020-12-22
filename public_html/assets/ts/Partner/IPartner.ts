import { IExchange } from "../Exchange/IExchange";

export interface IPartner{

    id: number;
    videoElement: HTMLElement;
    connection: RTCPeerConnection;
    exchange: IExchange;
    createOffer(): void;
}