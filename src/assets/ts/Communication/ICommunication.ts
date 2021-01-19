import { IPartner } from "../Partner/IPartner";

export interface ICommunication{

    getPeerConnection(): RTCPeerConnection;

    getDataChannel(pc: RTCPeerConnection): any;

    addOnicecandidateEvent(callback: (candidate: any, partner: IPartner) => void): void; 

    addOnaddtrackEvent(callback: (stream: any, partner: IPartner) => void): void;

    addConnectionLosedEvent(callback: (partner: IPartner) => void): void;

    addConnectionEvent(callback: (partner: IPartner) => void): void;

    addCheckingEvent(callback: (partner: IPartner) => void): void;

    addOnMessageEvent(callback: (message: any, partner: IPartner) => void): void;

}