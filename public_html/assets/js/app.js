import { Firebase } from "./Exchange/Firebase.js";
import { Partner } from "./Partner/Partner.js";
import { Controls } from "./Elements/Controls.js";
import { Screen } from "./Elements/Screen.js";
export class App {
    constructor() {
        this.room = "default";
        this.yourId = Math.floor(Math.random() * 1000000000);
        this.partners = {};
        console.log("Id: " + this.yourId);
        this.yourVideo = document.getElementById("yourVideo");
        this.exchange = new Firebase(this.room, this.yourId);
        this.exchange.addReadEvent(this.readMessage);
        this.controls = new Controls(this);
        this.screen = new Screen(this);
        $(window).on("beforeunload", function () {
            app.hangOut();
        });
    }
    run() {
        this.initialCamera();
    }
    initialCamera() {
        if (!app.localStream) {
            navigator.mediaDevices.getUserMedia({ audio: true, video: true })
                .then(function (stream) {
                // @ts-ignore
                app.yourVideo.srcObject = stream;
                app.localStream = stream;
                app.controls.initialiseStream();
                app.callOther();
            });
        }
        else {
            // @ts-ignore
            app.yourVideo.srcObject = app.localStream;
        }
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
            app.partners[sender] = null;
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
            this.partners[partnerId] = null;
        }
        this.partners[partnerId] = new Partner(partnerId, this.exchange);
        this.setStreamToPartner(this.partners[partnerId], true);
    }
    setStreamToPartners() {
        for (var id in this.partners) {
            this.setStreamToPartner(this.partners[id]);
        }
    }
    setStreamToPartner(partner, initial = false) {
        if (initial) {
            partner.connection.addTrack(this.localStream.getVideoTracks()[0], this.localStream);
            partner.connection.addTrack(this.localStream.getAudioTracks()[0], this.localStream);
        }
        else {
            var videoTrack = !this.screen.onScreenMode() ? this.localStream.getVideoTracks()[0] : this.localScreenStream.getVideoTracks()[0];
            var sender = partner.connection.getSenders().find(function (s) {
                return s.track.kind == videoTrack.kind;
            });
            sender.replaceTrack(videoTrack);
        }
    }
    hangOut() {
        this.exchange.sendMessage(JSON.stringify({ 'closing': this.yourId }));
        this.exchange.closeConnection();
        for (var id in this.partners) {
            this.partners[id].connection.close();
        }
        $("#video-area .video-item-partner").remove();
    }
}
var app = new App();
app.run();
//# sourceMappingURL=app.js.map