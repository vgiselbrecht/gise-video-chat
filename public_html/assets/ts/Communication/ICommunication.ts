import { IPartner } from "../Partner/IPartner.js";

export interface ICommunication{

    getPeerConnection(): RTCPeerConnection;

    addOnicecandidateEvent(callback: (candidate: any, partner: IPartner) => void): void; 

    addOnaddstreamEvent(callback: (stream: any, partner: IPartner) => void): void;

    addConnectionLosedEvent(callback: (partner: IPartner) => void): void;

}