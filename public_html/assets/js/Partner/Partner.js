import { WebRTC } from "../Communication/WebRTC.js";
export class Partner {
    constructor(id, exchange) {
        this.id = id;
        this.exchange = exchange;
        var communication = new WebRTC(this);
        communication.addOnaddstreamEvent(this.onAddStream);
        communication.addOnicecandidateEvent(this.onIceCandidate);
        communication.addConnectionLosedEvent(this.onConnectionLosed);
        this.connection = communication.getPeerConnection();
    }
    createOffer() {
        let cla = this;
        this.connection.createOffer()
            .then(function (offer) {
            return cla.connection.setLocalDescription(offer);
        })
            .then(function () {
            cla.exchange.sendMessage(JSON.stringify({ 'sdp': cla.connection.localDescription }), cla.id);
        });
    }
    onIceCandidate(candidate, partner) {
        partner.exchange.sendMessage(JSON.stringify({ 'ice': candidate }), this.id);
    }
    ;
    // @ts-ignore
    onAddStream(stream, partner) {
        partner.addVideoElement();
        // @ts-ignore
        partner.videoElement.srcObject = stream;
    }
    ;
    addVideoElement() {
        if (this.videoElement == undefined) {
            $("#video-area").append('<div class="video-item video-item-partner" id="video-item-' + this.id + '"><div class="video-wrap"><video id="video-' + this.id + '" autoplay playsinline></video></div></div>');
            this.videoElement = document.getElementById('video-' + this.id);
        }
    }
    onConnectionLosed(partner) {
        console.log("Connection closed to: " + partner.id);
        $('#video-item-' + partner.id).remove();
    }
}
//# sourceMappingURL=Partner.js.map