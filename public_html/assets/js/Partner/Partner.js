import { WebRTC } from "../Communication/WebRTC.js";
export class Partner {
    constructor(id, exchange) {
        this.id = id;
        this.exchange = exchange;
        $("#video-area").append('<video id="video-' + id + '" autoplay playsinline></video>');
        this.videoElement = document.getElementById('video-' + id);
        var communication = new WebRTC(this);
        communication.addOnaddstreamEvent(this.onaddstream);
        communication.addOnicecandidateEvent(this.onicecandidate);
        communication.addConnectionLosedEvent(this.onconnectionlosed);
        this.connection = communication.getPeerConnection();
    }
    CreateOffer() {
        let cla = this;
        this.connection.createOffer()
            .then(function (offer) {
            return cla.connection.setLocalDescription(offer);
        })
            .then(function () {
            cla.exchange.sendMessage(JSON.stringify({ 'sdp': cla.connection.localDescription }), cla.id);
        });
    }
    onicecandidate(candidate, partner) {
        partner.exchange.sendMessage(JSON.stringify({ 'ice': candidate }), this.id);
    }
    ;
    // @ts-ignore
    onaddstream(stream, partner) {
        // @ts-ignore
        partner.videoElement.srcObject = stream;
    }
    ;
    onconnectionlosed(partner) {
        console.log("Connection closed to: " + this.id);
        partner.videoElement.remove();
    }
}
//# sourceMappingURL=Partner.js.map