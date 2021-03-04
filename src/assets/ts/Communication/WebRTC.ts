
import { ICommunication } from "./ICommunication";
import { IPartner } from "../Partner/IPartner";
import { IceServers } from "../Utils/IceServers";

export class WebRTC implements ICommunication{  

    servers = {'iceServers': IceServers.iceServers}; 
    partner: IPartner;
    onicecandidateEvent: (candidate: any, partner: IPartner) => void;
    onaddtrackEvent: (stream: any, partner: IPartner) => void;
    connectionLosedEvent: (partner: IPartner) => void;
    connectionEvent: (partner: IPartner) => void;
    checkingEvent: (partner: IPartner) => void;
    onMessageEvent: (message: any, partner: IPartner) => void;

    constructor(partner: IPartner){
        this.partner = partner;
    }

    getPeerConnection(): RTCPeerConnection{
        var pc = new RTCPeerConnection(this.servers);
        this.setPCEvents(pc);
        return pc;
    }

    setPCEvents(pc: RTCPeerConnection){
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
            console.log("ICE status: " + pc.iceConnectionState);
            if(pc.iceConnectionState == 'disconnected') {
                cla.connectionLosedEvent(cla.partner);
            } else if (pc.iceConnectionState == 'connected'){
                cla.connectionEvent(cla.partner);
            } else if (pc.iceConnectionState == 'checking'){
                cla.checkingEvent(cla.partner);
            }
        }
    }

    getDataChannel(pc: RTCPeerConnection){
        let cla = this;
         var dataChannel = pc.createDataChannel("chat", {negotiated: true, id: 0});
          
         dataChannel.onerror = function (error) { 
            console.log(error);
         };
          
         dataChannel.onmessage = function (event) { 
            cla.onMessageEvent(JSON.parse(event.data), cla.partner);
         };  

         dataChannel.onclose = function(event) {
            console.log("Data Channel is diconnected!"); 
            //cla.connectionLosedEvent(cla.partner); 
          }

         return dataChannel;
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

    addConnectionEvent(callback: (partner: IPartner) => void): void{
        this.connectionEvent = callback;
    }

    addCheckingEvent(callback: (partner: IPartner) => void): void{
        this.checkingEvent = callback;
    }

    addOnMessageEvent(callback: (message: any, partner: IPartner) => void): void{
        this.onMessageEvent = callback;
    }
}