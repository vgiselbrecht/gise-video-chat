import { IPartner } from "./IPartner";
import { WebRTC } from "../Communication/WebRTC";
import { IExchange } from "../Exchange/IExchange";
import { JQueryUtils } from "../Utils/JQuery";
import { Devices } from "../Elements/Devices";
import { Textchat } from "../Elements/Textchat";
import { Userinfo } from "../Elements/Userinfo";
import { Videogrid } from "../Elements/Videogrid";
import { Controls } from "../Elements/Controls";
import { Video } from "../Elements/Video";
import { PartnerListElement } from "../Elements/PartnerListElement";
import { Settings } from "../Utils/Settings";
import config from "../../../config.json"


export class Partner implements IPartner{

    id: number;
    name: string;
    muted: boolean;
    cameraOff: boolean;
    screenSharing: boolean;
    listener: boolean;
    videoElement: HTMLElement;
    connection: RTCPeerConnection;
    dataChannel: any;
    devices: Devices;
    textchat: Textchat;
    exchange: IExchange;
    videogrid: Videogrid;
    controls: Controls;
    connected: boolean = false;
    checking: boolean = false;
    messages: Array<any> = Array<any>();
    onConnectedEvent: (partner: IPartner) => void;
    onConnectionClosedEvent: (partner: IPartner) => void;
    onConnectionLosedEvent: (partner: IPartner) => void;
    
    doReload: boolean = false;
    closed: boolean = false;
    gotTracks: boolean = false;
    
    videoGridElement: Video;
    partnerListElement: PartnerListElement;
    stream: any;

    lastPing: Date = new Date();
    millisecondsBeforeHide: number = 10000;
    lastConnectionLost: Date = new Date();
    calls: number = 0;
    maxCalls: number = 30;
    constructor(
        id: number, 
        exchange: IExchange, 
        devices: Devices, 
        textchat: Textchat, 
        videogrid: Videogrid, 
        controls: Controls,
        onConnectedEvent: (partner: IPartner) => void,
        onConnectionClosedEvent: (partner: IPartner) => void,
        onConnectionLosedEvent: (partner: IPartner) => void){
            this.id = id;
            this.exchange = exchange;
            this.devices = devices;
            this.textchat = textchat;
            this.videogrid = videogrid;
            this.controls = controls;
            this.onConnectedEvent = onConnectedEvent;
            this.onConnectionClosedEvent = onConnectionClosedEvent;
            this.onConnectionLosedEvent = onConnectionLosedEvent;

            this.addVideoElement();
            this.videogrid.recalculateLayout();

            var communication = new WebRTC(this);
            communication.addOnaddtrackEvent(this.onAddTrack);
            communication.addOnicecandidateEvent(this.onIceCandidate); 
            communication.addConnectionLosedEvent(this.onConnectionLosed);
            communication.addConnectionEvent(this.onConnected);
            communication.addOnMessageEvent(this.onMessage);
            communication.addCheckingEvent(this.checkingConnection);
            this.connection = communication.getPeerConnection();
            this.dataChannel = communication.getDataChannel(this.connection);
            this.setSendMessageInterval();
            this.checkConnection();
    }

    getName(): string{
        if(!this.name || this.name === ""){
            return "Gast" + this.id.toString();
        }
        return this.name;
    }

    setName(name: string){
        this.name = name;
        this.videoGridElement.videoVueObject.name = this.getName();
        this.partnerListElement.partnerListElementVueObject.name = this.getName();
    }

    setMuted(muted: boolean){
        this.muted = muted;
        this.videoGridElement.videoVueObject.muted = muted;
        this.partnerListElement.partnerListElementVueObject.muted = muted;
    }

    setCameraOff(cameraOff: boolean){
        this.cameraOff = cameraOff;
        this.videoGridElement.videoVueObject.cameraOff = cameraOff;
        this.partnerListElement.partnerListElementVueObject.cameraOff = cameraOff;
    }

    setScreenSharing(screenSharing: boolean){
        this.screenSharing = screenSharing;
        this.videoGridElement.videoVueObject.screenSharing = screenSharing;
        this.partnerListElement.partnerListElementVueObject.screenSharing = screenSharing;
    }

    setListener(listener: boolean){
        this.listener = listener;
        this.videoGridElement.videoVueObject.listener = listener;
        this.partnerListElement.partnerListElementVueObject.listener = listener;
    }

    checkConnection(){
        var cla = this;
        setInterval(function(){
            if(!cla.connected && !cla.closed && !cla.checking){
                if(cla.lastPing.getTime() <= new Date().getTime() - 2000){
                    cla.callPartner();
                }
                if(cla.lastPing.getTime() <= new Date().getTime() - cla.millisecondsBeforeHide
                && cla.lastConnectionLost.getTime() <= new Date().getTime() - cla.millisecondsBeforeHide)
                {
                    cla.hidePartnerElement();
                }else{
                    cla.showPartnerElement();
                }
            } else if(cla.connected || cla.checking){
                cla.showPartnerElement();
            }
        }, 2000);
    }

    callPartner(){
        if(this.calls !== this.maxCalls){
            this.exchange.sendMessage({'call': 'recall'}, this.id);
            this.calls++;
        } else{
            this.closeConnection();
        }
    }

    createOffer(doLoop: boolean = false): void {
        if((!this.connected && !this.closed) || this.doReload){
            console.log("Create Offer to: " + this.id);
            let cla = this;
            this.connection.createOffer({iceRestart: true, offerToReceiveAudio: true, offerToReceiveVideo: true})
            .then(function(offer){
                return cla.connection.setLocalDescription(offer);
            })
            .then(function(){
                cla.exchange.sendMessage({'sdp': cla.connection.localDescription}, cla.id);
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
        });
    }

    onIceCandidate(candidate: any, partner: IPartner) {
        partner.exchange.sendMessage({'ice': candidate}, partner.id);
    };
    
    onAddTrack(stream: any, partner: IPartner) { 
        partner.addVideoElement();
        // @ts-ignore
        partner.videoElement.srcObject = stream;
        partner.gotTracks = true;
    };

    checkingConnection(partner: IPartner){
        partner.checking = true;
        partner.showPartnerElement();
    }

    onConnected(partner: IPartner){
        console.log("Connection to: " + partner.id);
        partner.connected = true;
        partner.checking = false;
        partner.calls = 0;
        if(this.doReload){
            this.reloadConnection();
        }

        $('#video-item-'+partner.id).removeClass("unconnected");
        partner.showPartnerElement();
        partner.onConnectedEvent(partner);
        partner.partnerListElement.partnerListElementVueObject.connected = true;

        setTimeout(function(){
            if(!partner.gotTracks && !partner.listener){
                partner.reloadConnection();
            }
        }, 2000);


        //start playing video with sound
        var videoplayInterval = setInterval(function(){
            // @ts-ignore
            if(partner.videoElement.paused){
                // @ts-ignore
                partner.videoElement.play();
            }else{
                clearInterval(videoplayInterval);
            }
        }, 100);
        
    }

    onConnectionLosed(partner: IPartner){
        console.log("Connection losed to: " + partner.id);
        partner.connected = false;
        partner.checking = false;
        partner.lastConnectionLost = new Date();
        //partner.callPartner();
        $('#video-item-'+partner.id).addClass("unconnected");
        partner.onConnectionLosedEvent(partner);
        partner.partnerListElement.partnerListElementVueObject.connected = false;
    }

    reloadConnection(){
        if(this.connected){
            this.doReload = true;
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
        this.onConnectionLosedEvent(this);
        this.partnerListElement.partnerListElementVueObject.connected = false;
        this.videogrid.recalculateLayout();
    }

    setSinkId(sinkId: any): void{
        if(this.videoElement != undefined){
            // @ts-ignore
            if(typeof this.videoElement.sinkId !== 'undefined'){
                // @ts-ignore
                this.videoElement.setSinkId(sinkId);
            }
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
                partner.setMuted(message.message.muted);
                partner.setCameraOff(message.message.cameraOff);
                partner.setScreenSharing(message.message.screenSharing);
                partner.setListener(message.message.listener);
            } else if(message.type === partner.controls.muteType && Settings.getValueOrDefault(config, "features.mutePartner", true)){
                partner.controls.setToMuted();
            }
        }
    }

    addVideoElement(){
        var cla = this;
        if(this.videoElement == undefined){
            $("#video-area").append('<div class="video-item video-item-partner unconnected" id="video-item-'+this.id+'"><div class="video-wrap"><div class="video-inner-wrap"><video id="video-'+this.id+'" autoplay playsinline></video></div></div></div>');
            this.videoElement = document.getElementById('video-'+this.id);
            this.videoGridElement = new Video(document.getElementById('video-item-'+this.id), this);
            this.partnerListElement = new PartnerListElement(this);
            this.videogrid.recalculateLayout();
            $(this.videoElement).on("loadeddata", function() {
                    cla.videogrid.recalculateLayout();
            });
        }
        setTimeout(function(){
            cla.setSinkId(cla.devices.devicesVueObject.sound);
        }, 1);
    }

    hidePartnerElement(){
        if(!$('#video-item-'+ this.id).hasClass("hide")){
            console.log("Hide partner video: " + this.id);
            $('#video-item-'+ this.id).addClass("hide");
            this.videogrid.recalculateLayout();
        }
    }

    showPartnerElement(){
        if($('#video-item-'+ this.id).hasClass("hide")){
            $('#video-item-'+ this.id).removeClass("hide");
            this.videogrid.recalculateLayout();
        }
    }

}