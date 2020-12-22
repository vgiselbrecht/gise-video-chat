import { Firebase } from "./Exchange/Firebase.js";
import { Partner } from "./Partner/Partner.js";
class App {
    constructor() {
        this.room = "default";
        this.yourId = Math.floor(Math.random() * 1000000000);
        this.partners = {};
        console.log("Id: " + this.yourId);
        this.yourVideo = document.getElementById("yourVideo");
        this.exchange = new Firebase(this.room, this.yourId);
        this.exchange.addReadEvent(this.readMessage);
    }
    run() {
        this.initialCamera();
        setTimeout(function () {
            app.CallOther();
        }, 1000);
    }
    initialCamera() {
        navigator.mediaDevices.getUserMedia({ audio: true, video: true })
            .then(function (stream) {
            // @ts-ignore
            app.yourVideo.srcObject = stream;
            app.localStream = stream;
        });
    }
    CallOther() {
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
            app.partners[sender].CreateOffer();
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
        if (partnerId in app.partners) {
            this.partners[partnerId].connection.close();
            this.partners[partnerId] = null;
        }
        this.partners[partnerId] = new Partner(partnerId, this.exchange);
        // @ts-ignore
        this.partners[partnerId].connection.addStream(this.localStream);
    }
}
var app = new App();
app.run();
//# sourceMappingURL=app.js.map