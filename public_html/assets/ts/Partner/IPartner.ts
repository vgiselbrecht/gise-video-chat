import { IExchange } from "../Exchange/IExchange";

export interface IPartner{

    id: number;
    videoElement: HTMLElement;
    connection: RTCPeerConnection;
    exchange: IExchange;
    CreateOffer(): void;
    onicecandidate(candidate: any, partner: IPartner);
    onaddstream(stream: any, partner: IPartner);
}