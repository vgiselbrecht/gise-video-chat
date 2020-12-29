import { WebRTC } from "../Communication/WebRTC.js";
import { JQueryUtils } from "../Utils/JQuery.js";
import { Userinfo } from "../Elements/Userinfo.js";
export class Partner {
    constructor(id, exchange, devices, textchat) {
        this.connected = false;
        this.messages = Array();
        this.id = id;
        this.exchange = exchange;
        this.devices = devices;
        this.textchat = textchat;
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
    getName() {
        var _a;
        return (_a = this.name) !== null && _a !== void 0 ? _a : "Gast" + this.id.toString();
    }
    setName(name) {
        this.name = name;
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
            $("#video-area").append('<div class="video-item video-item-partner" id="video-item-' + this.id + '"><div class="video-wrap"><div class="video-inner-wrap"><video id="video-' + this.id + '" autoplay playsinline></video></div></div></div>');
            this.videoElement = document.getElementById('video-' + this.id);
            JQueryUtils.addToBigfunction("video-item-" + this.id);
            this.setSinkId(this.devices.devicesVueObject.sound);
        }
    }
    onConnected(partner) {
        partner.connected = true;
        clearInterval(partner.offerLoop);
        $('#video-item-' + partner.id).show();
    }
    onConnectionLosed(partner) {
        partner.connected = false;
        partner.createOffer();
        $('#video-item-' + partner.id).hide();
    }
    closeConnection() {
        this.connection.close();
        console.log("Connection closed to: " + this.id);
        $('#video-item-' + this.id).remove();
    }
    setSinkId(sinkId) {
        if (this.videoElement != undefined) {
            // @ts-ignore
            this.videoElement.setSinkId(sinkId);
        }
    }
    sendMessage(message) {
        this.messages.push(message);
    }
    setSendMessageInterval() {
        var cla = this;
        setInterval(function () {
            if (cla.dataChannel.readyState === "open") {
                for (var message of cla.messages) {
                    cla.dataChannel.send(JSON.stringify(message));
                }
                cla.messages = Array();
            }
        }, 100);
    }
    onMessage(message, partner) {
        console.log("Communication message from " + partner.id);
        console.log(message);
        if (message.type !== undefined && message.message !== undefined) {
            if (message.type === partner.textchat.textchatMessageType) {
                partner.textchat.addNewPartnerMessageToChat(message.message, partner);
            }
            else if (message.type === Userinfo.userinfoMessageType && message.message.name != undefined) {
                partner.setName(message.message.name);
            }
        }
    }
}
//# sourceMappingURL=Partner.js.map