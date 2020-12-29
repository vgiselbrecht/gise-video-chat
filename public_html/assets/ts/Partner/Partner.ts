import { IPartner } from "./IPartner.js";
import { WebRTC } from "../Communication/WebRTC.js";
import { IExchange } from "../Exchange/IExchange.js";
import { JQueryUtils } from "../Utils/JQuery.js";
import { Devices } from "../Elements/Devices.js";
import { Textchat } from "../Elements/Textchat.js";
import { Userinfo } from "../Elements/Userinfo.js";


export class Partner implements IPartner{

    id: number;
    name: string;
    videoElement: HTMLElement;
    connection: RTCPeerConnection;
    dataChannel: any;
    devices: Devices;
    textchat: Textchat;
    exchange: IExchange
    connected: boolean = false;
    offerLoop: any;
    messages: Array<any> = Array<any>();
    setStreamToPartner: (partner: IPartner, initial: boolean) => void;
    doReload: boolean = false;

    constructor(id: number, exchange: IExchange, devices: Devices, textchat: Textchat, setStreamToPartner: (partner: IPartner, initial: boolean) => void){
        this.id = id;
        this.exchange = exchange;
        this.devices = devices;
        this.textchat = textchat;
        this.setStreamToPartner = setStreamToPartner;
        var communication = new WebRTC(this);
        communication.addOnaddtrackEvent(this.onAddTrack);
        communication.addOnicecandidateEvent(this.onIceCandidate); 
        communication.addConnectionLosedEvent(this.onConnectionLosed);
        communication.addConnectionEvent(this.onConnected);
        communication.addOnMessageEvent(this.onMessage);
        this.connection = communication.getPeerConnection();
        this.dataChannel = communication.getDataChannel(this.connection);
        this.setSendMessageInterval();
    }

    getName(): string{
        return this.name ?? "Gast" + this.id.toString();
    }

    setName(name: string){
        this.name = name;
    }

    createOffer(): void {
        this.createOfferInner();
        var loop = 12;
        var cla = this;
        this.offerLoop = setInterval(function(){
            if(!cla.connected){
                if(loop == 0){
                    clearInterval(cla.offerLoop);
                    cla.closeConnection();
                }else{
                    cla.createOfferInner();
                    loop--;
                }
            }
        }, 5000);
    }

    createOfferInner(): void{
        if(!this.connected){
            let cla = this;
            this.connection.createOffer({iceRestart: true})
            .then(function(offer){
                return cla.connection.setLocalDescription(offer);
            })
            .then(function(){
                cla.exchange.sendMessage(JSON.stringify({'sdp': cla.connection.localDescription}), cla.id);
            });
        }
    }

    onIceCandidate(candidate: any, partner: IPartner) {
        partner.exchange.sendMessage(JSON.stringify({'ice': candidate}), this.id);
    };
    
    onAddTrack(stream: any, partner: IPartner) { 
        partner.addVideoElement();
        // @ts-ignore
        partner.videoElement.srcObject = stream;
    };

    addVideoElement(){
        if(this.videoElement == undefined){
            $("#video-area").append('<div class="video-item video-item-partner" id="video-item-'+this.id+'"><div class="video-wrap"><div class="video-inner-wrap"><video id="video-'+this.id+'" autoplay playsinline></video></div></div></div>');
            this.videoElement = document.getElementById('video-'+this.id);
            JQueryUtils.addToBigfunction("video-item-"+this.id);
            this.setSinkId(this.devices.devicesVueObject.sound);
        }
    }

    onConnected(partner: IPartner){
        partner.connected = true;
        if(this.doReload){
            this.reloadConnection();
        }
        clearInterval(partner.offerLoop);
        $('#video-item-'+partner.id).show();
        partner.setStreamToPartner(this, false);
    }

    onConnectionLosed(partner: IPartner){
        partner.connected = false;
        partner.createOffer(); 
        $('#video-item-'+partner.id).hide();
    }

    reloadConnection(){
        if(this.connected){
            this.connected = false;
            this.createOffer();
            this.doReload = false;
        } else {
            this.doReload = true;
        }
    }

    closeConnection(){
        this.connection.close();
        console.log("Connection closed to: "+this.id);
        $('#video-item-'+this.id).remove();
    }

    setSinkId(sinkId: any): void{
        if(this.videoElement != undefined){
            // @ts-ignore
            this.videoElement.setSinkId(sinkId);
        }
    }

    sendMessage(message: any): void{
        this.messages.push(message);
    }

    setSendMessageInterval(){
        var cla = this;
        setInterval(function(){
            if(cla.dataChannel.readyState === "open"){
                for (var message of cla.messages) {
                    cla.dataChannel.send(JSON.stringify(message));
                }
                cla.messages = Array<any>();
            }
        }, 100); 
    }

    onMessage(message: any, partner: IPartner){
        console.log("Communication message from " + partner.id)
        console.log(message);
        if(message.type !== undefined && message.message !== undefined){
            if(message.type === partner.textchat.textchatMessageType){
                partner.textchat.addNewPartnerMessageToChat(message.message, partner);
            } else if(message.type === Userinfo.userinfoMessageType && message.message.name != undefined){
                partner.setName(message.message.name);
            }
        }
    }

}