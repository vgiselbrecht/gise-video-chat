import { IPartner } from "./IPartner.js";
import { WebRTC } from "../Communication/WebRTC.js";
import { IExchange } from "../Exchange/IExchange.js";
import { JQueryUtils } from "../Utils/JQuery.js";
import { Devices } from "../Elements/Devices.js";
import { Textchat } from "../Elements/Textchat.js";
import { Userinfo } from "../Elements/Userinfo.js";
import { Videogrid } from "../Elements/Videogrid.js";
import { Video } from "../Elements/Video.js";


export class Partner implements IPartner{

    id: number;
    name: string;
    videoElement: HTMLElement;
    connection: RTCPeerConnection;
    dataChannel: any;
    devices: Devices;
    textchat: Textchat;
    exchange: IExchange
    videogrid: Videogrid
    connected: boolean = false;
    offerLoop: any;
    messages: Array<any> = Array<any>();
    setStreamToPartner: (partner: IPartner, initial: boolean) => void;
    doReload: boolean = false;
    birectionalOffer: boolean = false;
    closed: boolean = false;
    videoGridElement: Video;

    constructor(id: number, exchange: IExchange, devices: Devices, textchat: Textchat, videogrid: Videogrid, setStreamToPartner: (partner: IPartner, initial: boolean) => void){
        this.id = id;
        this.exchange = exchange;
        this.devices = devices;
        this.textchat = textchat;
        this.videogrid = videogrid;
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
        var cla = this;
        setTimeout(function(){
            cla.addVideoElement();
            cla.videogrid.recalculateLayout();
        }, 100);
    }

    getName(): string{
        return this.name ?? "Gast" + this.id.toString();
    }

    setName(name: string){
        this.name = name;
        this.videoGridElement.videoVueObject.name = name;
    }

    createOffer(): void {
        if(!this.offerLoop){
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
                }else{
                    clearInterval(cla.offerLoop);
                    cla.closeConnection();
                }
            }, 5000);
        }
    }

    createOfferInner(): void{
        if(!this.connected && !this.closed){
            console.log("Create Offer to: " + this.id);
            let cla = this;
            this.connection.createOffer({iceRestart: true})
            .then(function(offer){
                return cla.connection.setLocalDescription(offer);
            })
            .then(function(){
                cla.exchange.sendMessage({'sdp': cla.connection.localDescription}, cla.id);
                //cla.birectionalOffer = true;
            });
        }
    }

    createAnswer(offer: any): void{
        console.log("Create Answer to: " + this.id);
        var cla = this;
        this.connection.setRemoteDescription(new RTCSessionDescription(offer)) 
        .then(function(){ 
            return cla.connection.createAnswer();
        })
        .then(function(answer){
            return cla.connection.setLocalDescription(answer);
        })
        .then(function(){
            cla.exchange.sendMessage({'sdp': cla.connection.localDescription}, cla.id);
            /*
            if(!cla.birectionalOffer){
                cla.createOffer();
            }*/
        });
    }

    onIceCandidate(candidate: any, partner: IPartner) {
        partner.exchange.sendMessage({'ice': candidate}, partner.id);
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
            this.videoGridElement = new Video(document.getElementById('video-item-'+this.id), this);
            //JQueryUtils.addToBigfunction("video-item-"+this.id);
            this.setSinkId(this.devices.devicesVueObject.sound);
            this.videogrid.recalculateLayout();
        }
    }

    onConnected(partner: IPartner){
        partner.connected = true;
        if(this.doReload){
            this.reloadConnection();
        }
        clearInterval(partner.offerLoop);
        $('#video-item-'+partner.id).removeClass("unconnected");
        partner.setStreamToPartner(this, false);
        partner.videogrid.recalculateLayout();
    }

    onConnectionLosed(partner: IPartner){
        console.log("Connection losed to: " + partner.id);
        partner.connected = false;
        partner.createOffer(); 
        $('#video-item-'+partner.id).addClass("unconnected");
        partner.videogrid.recalculateLayout();
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
        this.closed = true;
        this.connection.close();
        console.log("Connection closed to: "+this.id);
        this.videoElement = null;
        $('#video-item-'+this.id).remove();
        this.videogrid.recalculateLayout();
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