import { IPartner } from "./IPartner.js";
import { WebRTC } from "../Communication/WebRTC.js";
import { IExchange } from "../Exchange/IExchange.js";

export class Partner implements IPartner{

    id: number;
    videoElement: HTMLElement;
    connection: RTCPeerConnection;
    exchange: IExchange

    constructor(id: number, exchange: IExchange){
        this.id = id;
        this.exchange = exchange;
        this.videoElement = document.getElementById("friendsVideo");
        var communication = new WebRTC(this);
        communication.addOnaddstreamEvent(this.onaddstream);
        communication.addOnicecandidateEvent(this.onicecandidate); 
        this.connection = communication.getPeerConnection();
    }

    CreateOffer(): void {
        let cla = this;
        this.connection.createOffer()
          .then(function(offer){
              return cla.connection.setLocalDescription(offer);
           })
          .then(function(){
            cla.exchange.sendMessage(JSON.stringify({'sdp': cla.connection.localDescription}), cla.id);
           });
    }

    onicecandidate(candidate: any, partner: IPartner) {
        partner.exchange.sendMessage(JSON.stringify({'ice': candidate}), this.id);
    };
    
    // @ts-ignore
    onaddstream(stream: any, partner: IPartner) { 
        // @ts-ignore
        partner.videoElement.srcObject = stream;
    };

}