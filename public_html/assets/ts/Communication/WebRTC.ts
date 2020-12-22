
import { ICommunication } from "./ICommunication.js";

export class WebRTC implements ICommunication{
    
    servers = {'iceServers': [{'urls': 'stun:stun.services.mozilla.com'}, {'urls': 'stun:stun.l.google.com:19302'}]};
    onicecandidateEvent: (candidate: any) => void;
    onaddstreamEvent: (stream: any) => void;

    getPeerConnection(): RTCPeerConnection{
        var pc = new RTCPeerConnection(this.servers);
        let cla = this;
        pc.onicecandidate = function(event) {
            if(event.candidate){
                cla.onicecandidateEvent(event.candidate);
            }else{
                console.log("Sent All Ice");
            }
        };
        // @ts-ignore
        pc.onaddstream = function(event) { 
            return cla.onaddstreamEvent(event.stream);
        };
        return pc;
    }

    addOnicecandidateEvent(callback: (candidate: any) => void): void{
        this.onicecandidateEvent = callback;
    }

    addOnaddstreamEvent(callback: (stream: any) => void): void{
        this.onaddstreamEvent = callback;
    }
}