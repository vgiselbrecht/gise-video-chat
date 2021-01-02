import { WebRTC } from "../Communication/WebRTC.js";
import { Userinfo } from "../Elements/Userinfo.js";
import { Video } from "../Elements/Video.js";
import { PartnerListElement } from "../Elements/PartnerListElement.js";
export class Partner {
    constructor(id, exchange, devices, textchat, videogrid, onConnectedEvent, onConnectionClosedEvent, onConnectionLosedEvent) {
        this.connected = false;
        this.messages = Array();
        this.doReload = false;
        this.birectionalOffer = false;
        this.closed = false;
        this.id = id;
        this.exchange = exchange;
        this.devices = devices;
        this.textchat = textchat;
        this.videogrid = videogrid;
        this.onConnectedEvent = onConnectedEvent;
        this.onConnectionClosedEvent = onConnectionClosedEvent;
        this.onConnectionLosedEvent = onConnectionLosedEvent;
        var cla = this;
        cla.addVideoElement();
        cla.videogrid.recalculateLayout();
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
        this.videoGridElement.videoVueObject.name = name;
        this.partnerListElement.partnerListElementVueObject.name = name;
    }
    setMuted(muted) {
        this.muted = muted;
        this.videoGridElement.videoVueObject.muted = muted;
        this.partnerListElement.partnerListElementVueObject.muted = muted;
    }
    setCameraOff(cameraOff) {
        this.cameraOff = cameraOff;
        this.videoGridElement.videoVueObject.cameraOff = cameraOff;
        this.partnerListElement.partnerListElementVueObject.cameraOff = cameraOff;
    }
    setScreenSharing(screenSharing) {
        this.screenSharing = screenSharing;
        this.videoGridElement.videoVueObject.screenSharing = screenSharing;
        this.partnerListElement.partnerListElementVueObject.screenSharing = screenSharing;
    }
    setListener(listener) {
        this.listener = listener;
        this.videoGridElement.videoVueObject.listener = listener;
        this.partnerListElement.partnerListElementVueObject.listener = listener;
    }
    createOffer(doLoop = false) {
        if (!this.offerLoop) {
            this.createOfferInner();
            var loop = 12;
            var cla = this;
            if (doLoop) {
                this.offerLoop = setInterval(function () {
                    if (!cla.connected) {
                        if (loop == 0) {
                            clearInterval(cla.offerLoop);
                            cla.offerLoop = null;
                            cla.closeConnection();
                        }
                        else {
                            cla.createOfferInner();
                            loop--;
                        }
                    }
                    else {
                        clearInterval(cla.offerLoop);
                        cla.offerLoop = null;
                    }
                }, 10000);
            }
        }
    }
    createOfferInner() {
        if ((!this.connected && !this.closed) || this.doReload) {
            console.log("Create Offer to: " + this.id);
            let cla = this;
            this.connection.createOffer({ iceRestart: true, offerToReceiveAudio: true, offerToReceiveVideo: true })
                .then(function (offer) {
                return cla.connection.setLocalDescription(offer);
            })
                .then(function () {
                cla.exchange.sendMessage({ 'sdp': cla.connection.localDescription }, cla.id);
            });
        }
    }
    createAnswer(offer) {
        console.log("Create Answer to: " + this.id);
        var cla = this;
        this.connection.setRemoteDescription(new RTCSessionDescription(offer))
            .then(function () {
            return cla.connection.createAnswer();
        })
            .then(function (answer) {
            return cla.connection.setLocalDescription(answer);
        })
            .then(function () {
            cla.exchange.sendMessage({ 'sdp': cla.connection.localDescription }, cla.id);
        });
    }
    onIceCandidate(candidate, partner) {
        partner.exchange.sendMessage({ 'ice': candidate }, partner.id);
    }
    ;
    onAddTrack(stream, partner) {
        partner.addVideoElement();
        // @ts-ignore
        partner.videoElement.srcObject = stream;
    }
    ;
    addVideoElement() {
        var cla = this;
        if (this.videoElement == undefined) {
            $("#video-area").append('<div class="video-item video-item-partner" id="video-item-' + this.id + '"><div class="video-wrap"><div class="video-inner-wrap"><video id="video-' + this.id + '" autoplay playsinline></video></div></div></div>');
            this.videoElement = document.getElementById('video-' + this.id);
            this.videoGridElement = new Video(document.getElementById('video-item-' + this.id), this);
            this.partnerListElement = new PartnerListElement(this);
            this.videogrid.recalculateLayout();
        }
        setTimeout(function () {
            cla.setSinkId(cla.devices.devicesVueObject.sound);
        }, 1);
    }
    onConnected(partner) {
        partner.connected = true;
        if (this.doReload) {
            this.reloadConnection();
        }
        if (partner.offerLoop) {
            clearInterval(partner.offerLoop);
            partner.offerLoop = null;
        }
        $('#video-item-' + partner.id).removeClass("unconnected");
        partner.onConnectedEvent(partner);
        partner.partnerListElement.partnerListElementVueObject.connected = true;
        partner.videogrid.recalculateLayout();
        //start playing video with sound
        var videoplayInterval = setInterval(function () {
            // @ts-ignore
            if (partner.videoElement.paused) {
                // @ts-ignore
                partner.videoElement.play();
            }
            else {
                clearInterval(videoplayInterval);
            }
        }, 100);
    }
    onConnectionLosed(partner) {
        console.log("Connection losed to: " + partner.id);
        partner.connected = false;
        partner.createOffer(true);
        $('#video-item-' + partner.id).addClass("unconnected");
        partner.onConnectionLosedEvent(partner);
        partner.partnerListElement.partnerListElementVueObject.connected = false;
        partner.videogrid.recalculateLayout();
    }
    reloadConnection() {
        if (this.connected) {
            this.doReload = true;
            this.createOffer();
            this.doReload = false;
        }
        else {
            this.doReload = true;
        }
    }
    closeConnection() {
        this.closed = true;
        this.connection.close();
        console.log("Connection closed to: " + this.id);
        this.videoElement = null;
        $('#video-item-' + this.id).remove();
        this.onConnectionLosedEvent(this);
        this.partnerListElement.partnerListElementVueObject.connected = false;
        this.videogrid.recalculateLayout();
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
                partner.setMuted(message.message.muted);
                partner.setCameraOff(message.message.cameraOff);
                partner.setScreenSharing(message.message.screenSharing);
                partner.setListener(message.message.listener);
            }
        }
    }
}
//# sourceMappingURL=Partner.js.map