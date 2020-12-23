import { WebRTC } from "../Communication/WebRTC.js";
export class Partner {
    constructor(id, exchange) {
        this.connected = false;
        this.id = id;
        this.exchange = exchange;
        var communication = new WebRTC(this);
        communication.addOnaddtrackEvent(this.onAddTrack);
        communication.addOnicecandidateEvent(this.onIceCandidate);
        communication.addConnectionLosedEvent(this.onConnectionLosed);
        communication.addConnectionEvent(this.onConnected);
        this.connection = communication.getPeerConnection();
    }
    createOffer() {
        this.createOfferInner();
        var loop = 12;
        var cla = this;
        this.offerLoop = setInterval(function () {
            if (!cla.connected) {
                if (loop == 0) {
                    clearInterval(cla.offerLoop);
                    cla.closeConnection();
                }
                else {
                    cla.createOfferInner();
                    loop--;
                }
            }
        }, 5000);
    }
    createOfferInner() {
        if (!this.connected) {
            let cla = this;
            this.connection.createOffer({ iceRestart: true })
                .then(function (offer) {
                return cla.connection.setLocalDescription(offer);
            })
                .then(function () {
                cla.exchange.sendMessage(JSON.stringify({ 'sdp': cla.connection.localDescription }), cla.id);
            });
        }
    }
    onIceCandidate(candidate, partner) {
        partner.exchange.sendMessage(JSON.stringify({ 'ice': candidate }), this.id);
    }
    ;
    onAddTrack(stream, partner) {
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
    onConnected(partner) {
        partner.connected = true;
        clearInterval(partner.offerLoop);
    }
    onConnectionLosed(partner) {
        partner.connected = false;
        partner.createOffer();
    }
    closeConnection() {
        this.connection.close();
        console.log("Connection closed to: " + this.id);
        $('#video-item-' + this.id).remove();
    }
}
//# sourceMappingURL=Partner.js.map