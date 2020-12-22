
import { ICommunication } from "./ICommunication.js";
import { IPartner } from "../Partner/IPartner.js";

export class WebRTC implements ICommunication{
    
    servers = {'iceServers': [{'urls': 'stun:stun.services.mozilla.com'}, {'urls': 'stun:stun.l.google.com:19302'}]};
    partner: IPartner;
    onicecandidateEvent: (candidate: any, partner: IPartner) => void;
    onaddstreamEvent: (stream: any, partner: IPartner) => void;

    constructor(partner: IPartner){
        this.partner = partner;
    }

    getPeerConnection(): RTCPeerConnection{
        var pc = new RTCPeerConnection(this.servers);
        let cla = this;
        pc.onicecandidate = function(event) {
            if(event.candidate){
                cla.onicecandidateEvent(event.candidate, cla.partner);
            }else{
                console.log("Sent All Ice");
            }
        };
        // @ts-ignore
        pc.onaddstream = function(event) { 
            return cla.onaddstreamEvent(event.stream, cla.partner);
        };
        return pc;
    }

    addOnicecandidateEvent(callback: (candidate: any, partner: IPartner) => void): void{
        this.onicecandidateEvent = callback;
    }

    addOnaddstreamEvent(callback: (stream: any, partner: IPartner) => void): void{
        this.onaddstreamEvent = callback;
    }
}