import "../sass/main.scss";
import '../images/chat.png'; 

import { IExchange } from "./Exchange/IExchange";
import { Firebase } from "./Exchange/Firebase";
import { ICommunication } from "./Communication/ICommunication";
import { WebRTC } from "./Communication/WebRTC";
import { IPartner } from "./Partner/IPartner";
import { IPartners } from "./Partner/IPartners";
import { Partner } from "./Partner/Partner";
import { Controls } from "./Elements/Controls";
import { Screen } from "./Elements/Screen";
import { Devices } from "./Elements/Devices";
import { Textchat } from "./Elements/Textchat";
import { Videogrid } from "./Elements/Videogrid";
import { Video } from "./Elements/Video";
import { PartnerListElement } from "./Elements/PartnerListElement";
import { Userinfo } from "./Elements/Userinfo";
import { Lightbox } from "./Elements/Lightbox";
import { Invite } from "./Elements/Invite";
import { JQueryUtils } from "./Utils/JQuery";
import { Alert } from "./Elements/Alert";
import { Translator } from "./Utils/Translator";

export class App{

    room: string;
    yourId: number = Math.floor(Math.random()*1000000000);
    yourName: string;
    exchange: IExchange;
    communication: ICommunication;
    yourVideo: HTMLElement;
    listener: boolean = false;
    localStream: any;
    localScreenStream: any;
    partners: IPartners = {};
    controls: Controls;
    screen: Screen;
    devices: Devices;
    textchat: Textchat;
    userinfo: Userinfo;
    videogrid: Videogrid;
    lightbox: Lightbox;
    invite: Invite;
    closed: boolean = false;
    called: boolean = false;
    yourVideoElement: Video;
    partnerListElement: PartnerListElement;

    constructor(){
        this.setRoom();
        console.log("Id: " + this.yourId + " Room: " + this.room);
        this.yourVideo = document.getElementById("yourVideo");
        this.exchange = new Firebase(this.room, this.yourId, function(){
            app.exchange.addReadEvent(app.readMessage);
        });
        this.yourVideoElement = new Video(document.getElementById("yourVideoArea"), null);
        this.partnerListElement = new PartnerListElement(null);
        this.controls = new Controls(this);
        this.screen = new Screen(this);
        this.devices = new Devices(this);
        this.textchat = new Textchat(this);
        this.userinfo = new Userinfo(this);
        this.lightbox = new Lightbox(this);
        this.invite = new Invite(this);
        this.videogrid = new Videogrid();
        this.videogrid.init();
        $(window).on("beforeunload", function() { 
            app.hangOut();
        });
    }

    run(){ 
        setTimeout(function(){
            if(!app.called){
                app.callOther(); 
            }
        }, 1000);
        
        navigator.mediaDevices.enumerateDevices().then(function(deviceInfos){
            app.devices.gotDevices(deviceInfos);
        });
    }

    setRoom(): void{
        var cla = this;
        if (!location.hash) {
            location.hash = Math.floor(Math.random() * 0xFFFFFF).toString(16);
        }
        this.room = location.hash.substring(1);
        window.onhashchange = function() {
            if(cla.room !== location.hash.substring(1)){
                location.reload();
            }
        }
    }

    initialCamera(first: boolean = false) {
        const constraints = {
            audio: {deviceId: this.devices.devicesVueObject.audio ? {exact: this.devices.devicesVueObject.audio} : undefined},
            video: {deviceId: this.devices.devicesVueObject.video ? {exact: this.devices.devicesVueObject.video} : undefined}
        };
        if(this.localStream){
            this.localStream.getTracks().forEach(track => track.stop());
        }
        navigator.mediaDevices.getUserMedia(constraints)
            .then(function(stream){
                app.setAsListener(false);
                if(!app.screen.onScreenMode()){
                    // @ts-ignore
                    app.yourVideo.srcObject = stream;
                }
                app.localStream = stream;
                app.controls.initialiseStream();
                app.setStreamToPartners();
                
                if(first){
                    if(!app.called){
                        app.callOther();  
                    }else{
                        app.reloadConnections();  
                    }
                }
            })
            .catch(function(err) {
                new Alert(Translator.get("mediaaccesserrormessage"));
                app.setAsListener(true);
                if(!app.called){
                    app.callOther(); 
                }
                console.log(err);
            });
    }

    callOther(){
        this.called = true;
        this.exchange.sendMessage({'call': this.yourId});
    }

    readMessage(sender: number, dataroom: string, msg) {
        if(app !== undefined && !this.closed){
            console.log("Exchange message from: " + sender)
            console.log(msg)
            if (!(sender in app.partners) && (msg.call !== undefined || msg.sdp !== undefined))
            {
                app.addPartner(sender);
            }
            if((sender in app.partners) && app.partners[sender]){
                var partnerConnection = app.partners[sender].connection;
                if (msg.call !== undefined)
                {
                    app.partners[sender].createOffer(true);
                }
                else if (msg.closing !== undefined)
                {
                    app.partners[sender].closeConnection();
                    delete app.partners[sender];
                }
                else if (msg.ice !== undefined)
                {
                    partnerConnection.addIceCandidate(new RTCIceCandidate(msg.ice));
                }
                else if (msg.sdp.type === "offer")
                {
                    app.partners[sender].createAnswer(msg.sdp);
                }
                else if (msg.sdp.type === "answer")
                {
                    partnerConnection.setRemoteDescription(new RTCSessionDescription(msg.sdp));
                }
            }
        }
    }

    addPartner(partnerId: number){
        var cla = this;
        if(partnerId in app.partners){
            this.partners[partnerId].closeConnection();
            delete this.partners[partnerId];
        }
        this.partners[partnerId] = null;
        this.partners[partnerId] = new Partner(partnerId, this.exchange, this.devices, this.textchat, this.videogrid, this.partnerOnConnected, this.partnerOnConnectionClosed, this.partnerOnConnectionLosed); 
        this.setStreamToPartner(this.partners[partnerId], true);
        this.videogrid.recalculateLayout();
    }

    partnerOnConnected(partner: IPartner){
        app.setStreamToPartner(partner);
    }

    partnerOnConnectionLosed(partner: IPartner){
    }

    partnerOnConnectionClosed(partner: IPartner){
        if(partner.id in app.partners){
            delete this.partners[partner.id];
        }
    }

    setStreamToPartners(){
        for (var id in this.partners) {
            this.setStreamToPartner(this.partners[id]);
        }
    }

    reloadConnections(){
        for (var id in this.partners) {
            this.partners[id].reloadConnection();
        }
    }

    setStreamToPartner(partner: IPartner, initial: boolean = false){
        if(app.localStream){
            var videoTrack = !app.screen.onScreenMode() ? app.localStream.getVideoTracks()[0] : app.localScreenStream.getVideoTracks()[0];
            var audioTrack = app.localStream.getAudioTracks()[0];
            app.setTrackToPartner(partner, app.localStream, videoTrack);
            app.setTrackToPartner(partner, app.localStream, audioTrack);
        } else if(app.localScreenStream){
            var videoTrack = app.localScreenStream.getVideoTracks()[0];
            //var audioTrack = app.localScreenStream.getAudioTracks()[0];
            app.setTrackToPartner(partner, app.localScreenStream, videoTrack);
            //app.setTrackToPartner(partner, app.localScreenStream, audioTrack);
        }
        partner.sendMessage(app.userinfo.getUserInfo());
    }

    setTrackToPartner(partner: IPartner, stream: any, track: any){
        var sender = partner.connection.getSenders().find(function(s) {
            return s.track && track && s.track.kind == track.kind;
        });
        if(sender){
            if(partner.connected){
                sender.replaceTrack(track);
            }
        } else {
            partner.connection.addTrack(track, stream);
        }
    }

    sendMessageToAllPartners(message: any){
        for (var id in this.partners) {
            if(this.partners[id]){
                this.partners[id].sendMessage(message);
            }
        }
    }

    sidebarToogle(open: boolean){
        $(".maincontainer").toggleClass("opensidebar"); 
        this.textchat.scrollToBottom();
        this.videogrid.recalculateLayout();
        //fix bug when calculation was wrong in the first calculation
        this.videogrid.recalculateLayout();
    }

    setAsListener(listener: boolean){
        this.listener = listener;
        this.yourVideoElement.videoVueObject.listener = listener;
        this.partnerListElement.partnerListElementVueObject.listener = listener;
    }

    hangOut(){
        this.closed = true;
        this.exchange.sendMessage({'closing': this.yourId});
        this.exchange.closeConnection();
        for (var id in this.partners) {
            if(this.partners[id]){
                this.partners[id].closeConnection();
            }
        }
    }
}

var app = null;
$(function() {
    Translator.setTranslationsInHTML();
    app = new App();
    app.run();
});