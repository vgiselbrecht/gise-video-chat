import { Firebase } from "./Exchange/Firebase.js";
import { Partner } from "./Partner/Partner.js";
import { Controls } from "./Elements/Controls.js";
import { Screen } from "./Elements/Screen.js";
import { Devices } from "./Elements/Devices.js";
import { JQueryUtils } from "./Utils/JQuery.js";
export class App {
    constructor() {
        this.yourId = Math.floor(Math.random() * 1000000000);
        this.partners = {};
        this.setRoom();
        console.log("Id: " + this.yourId + " Room: " + this.room);
        this.yourVideo = document.getElementById("yourVideo");
        this.exchange = new Firebase(this.room, this.yourId);
        this.exchange.addReadEvent(this.readMessage);
        this.controls = new Controls(this);
        this.screen = new Screen(this);
        this.devices = new Devices(this);
        $(window).on("beforeunload", function () {
            app.hangOut();
        });
        JQueryUtils.addToBigfunction("yourVideoArea");
    }
    run() {
        this.initialCamera(true);
    }
    setRoom() {
        if (!location.hash) {
            location.hash = Math.floor(Math.random() * 0xFFFFFF).toString(16);
        }
        this.room = location.hash.substring(1);
        window.onhashchange = function () {
            location.reload();
        };
    }
    initialCamera(first = false) {
        const constraints = {
            audio: { deviceId: this.devices.devicesVueObject.audio ? { exact: this.devices.devicesVueObject.audio } : undefined },
            video: { deviceId: this.devices.devicesVueObject.video ? { exact: this.devices.devicesVueObject.video } : undefined }
        };
        navigator.mediaDevices.getUserMedia(constraints)
            .then(function (stream) {
            // @ts-ignore
            app.yourVideo.srcObject = stream;
            app.localStream = stream;
            if (first) {
                navigator.mediaDevices.enumerateDevices().then(function (deviceInfos) {
                    app.devices.gotDevices(deviceInfos);
                });
                app.callOther();
            }
            app.controls.initialiseStream();
            app.setStreamToPartners();
        });
    }
    callOther() {
        this.exchange.sendMessage(JSON.stringify({ 'call': this.yourId }));
    }
    readMessage(sender, dataroom, msg) {
        console.log("From: " + sender);
        console.log(msg);
        if (!(sender in app.partners) || msg.call !== undefined) {
            app.addPartner(sender);
        }
        var partnerConnection = app.partners[sender].connection;
        if (msg.call !== undefined) {
            app.partners[sender].createOffer();
        }
        else if (msg.closing !== undefined) {
            app.partners[sender].closeConnection();
            delete app.partners[sender];
        }
        else if (msg.ice !== undefined) {
            partnerConnection.addIceCandidate(new RTCIceCandidate(msg.ice));
        }
        else if (msg.sdp.type === "offer") {
            partnerConnection.setRemoteDescription(new RTCSessionDescription(msg.sdp))
                .then(function () {
                return partnerConnection.createAnswer();
            })
                .then(function (answer) {
                return partnerConnection.setLocalDescription(answer);
            })
                .then(function () {
                app.exchange.sendMessage(JSON.stringify({ 'sdp': partnerConnection.localDescription }), sender);
            });
        }
        else if (msg.sdp.type === "answer") {
            partnerConnection.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        }
    }
    addPartner(partnerId) {
        var cla = this;
        if (partnerId in app.partners) {
            this.partners[partnerId].closeConnection();
            delete this.partners[partnerId];
        }
        this.partners[partnerId] = new Partner(partnerId, this.exchange, this.devices);
        this.setStreamToPartner(this.partners[partnerId], true);
    }
    setStreamToPartners() {
        for (var id in this.partners) {
            this.setStreamToPartner(this.partners[id]);
        }
    }
    setStreamToPartner(partner, initial = false) {
        var videoTrack = !this.screen.onScreenMode() ? this.localStream.getVideoTracks()[0] : this.localScreenStream.getVideoTracks()[0];
        var audioTrack = this.localStream.getAudioTracks()[0];
        this.setTrackToPartner(partner, this.localStream, videoTrack);
        this.setTrackToPartner(partner, this.localStream, audioTrack);
        /*if(initial){
            partner.connection.addTrack(videoTrack, this.localStream);
            partner.connection.addTrack(this.localStream.getAudioTracks()[0], this.localStream);
        } else{
            if(partner){
                var sender = partner.connection.getSenders().find(function(s) {
                    return s.track.kind == videoTrack.kind;
                });
                if(sender){
                    sender.replaceTrack(videoTrack);
                } else {
                    partner.connection.addTrack(videoTrack, this.localStream);
                }
            }
        }*/
    }
    setTrackToPartner(partner, stream, track) {
        var sender = partner.connection.getSenders().find(function (s) {
            return s.track.kind == track.kind;
        });
        if (sender) {
            sender.replaceTrack(track);
        }
        else {
            partner.connection.addTrack(track, stream);
        }
    }
    hangOut() {
        this.exchange.sendMessage(JSON.stringify({ 'closing': this.yourId }));
        this.exchange.closeConnection();
        for (var id in this.partners) {
            if (this.partners[id]) {
                this.partners[id].connection.close();
            }
        }
        $("#video-area .video-item-partner").remove();
    }
}
var app = new App();
app.run();
//# sourceMappingURL=app.js.map