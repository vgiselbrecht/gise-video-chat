
import { ICommunication } from "./ICommunication.js";
import { IPartner } from "../Partner/IPartner.js";

export class WebRTC implements ICommunication{
    
    servers = {'iceServers': [{'urls': 'stun:stun.services.mozilla.com'}, {'urls': 'stun:stun.l.google.com:19302'}]};
    partner: IPartner;
    onicecandidateEvent: (candidate: any, partner: IPartner) => void;
    onaddtrackEvent: (stream: any, partner: IPartner) => void;
    connectionLosedEvent: (partner: IPartner) => void;

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
                console.log("Sent All Ice to " + cla.partner.id);
            }
        };
        // @ts-ignore
        pc.ontrack = function(event) { 
            return cla.onaddtrackEvent(event.streams[0], cla.partner);
        };
        pc.oniceconnectionstatechange = function() {
            if(pc.iceConnectionState == 'disconnected') {
                cla.connectionLosedEvent(cla.partner);
            }
        }
        return pc;
    }

    addOnicecandidateEvent(callback: (candidate: any, partner: IPartner) => void): void{
        this.onicecandidateEvent = callback;
    }

    addOnaddtrackEvent(callback: (stream: any, partner: IPartner) => void): void{
        this.onaddtrackEvent = callback;
    }

    addConnectionLosedEvent(callback: (partner: IPartner) => void): void{
        this.connectionLosedEvent = callback;
    }
}