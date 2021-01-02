/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "App": () => /* binding */ App
/* harmony export */ });
/* harmony import */ var _Exchange_Firebase__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var _Partner_Partner__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2);
/* harmony import */ var _Elements_Controls__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(8);
/* harmony import */ var _Elements_Screen__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(9);
/* harmony import */ var _Elements_Devices__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(10);
/* harmony import */ var _Elements_Textchat__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(11);
/* harmony import */ var _Elements_Videogrid__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(13);
/* harmony import */ var _Elements_Video__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(6);
/* harmony import */ var _Elements_PartnerListElement__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(7);
/* harmony import */ var _Elements_Userinfo__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(4);
/* harmony import */ var _Elements_Lightbox__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(14);











class App {
    constructor() {
        this.yourId = Math.floor(Math.random() * 1000000000);
        this.listener = false;
        this.partners = {};
        this.closed = false;
        this.called = false;
        this.setRoom();
        console.log("Id: " + this.yourId + " Room: " + this.room);
        this.yourVideo = document.getElementById("yourVideo");
        this.exchange = new _Exchange_Firebase__WEBPACK_IMPORTED_MODULE_0__.Firebase(this.room, this.yourId);
        this.exchange.addReadEvent(this.readMessage);
        this.yourVideoElement = new _Elements_Video__WEBPACK_IMPORTED_MODULE_7__.Video(document.getElementById("yourVideoArea"), null);
        this.partnerListElement = new _Elements_PartnerListElement__WEBPACK_IMPORTED_MODULE_8__.PartnerListElement(null);
        this.controls = new _Elements_Controls__WEBPACK_IMPORTED_MODULE_2__.Controls(this);
        this.screen = new _Elements_Screen__WEBPACK_IMPORTED_MODULE_3__.Screen(this);
        this.devices = new _Elements_Devices__WEBPACK_IMPORTED_MODULE_4__.Devices(this);
        this.textchat = new _Elements_Textchat__WEBPACK_IMPORTED_MODULE_5__.Textchat(this);
        this.userinfo = new _Elements_Userinfo__WEBPACK_IMPORTED_MODULE_9__.Userinfo(this);
        this.lightbox = new _Elements_Lightbox__WEBPACK_IMPORTED_MODULE_10__.Lightbox(this);
        this.videogrid = new _Elements_Videogrid__WEBPACK_IMPORTED_MODULE_6__.Videogrid();
        this.videogrid.init();
        $(window).on("beforeunload", function () {
            app.hangOut();
        });
    }
    run() {
        setTimeout(function () {
            if (!app.called) {
                app.callOther();
            }
        }, 1000);
        navigator.mediaDevices.enumerateDevices().then(function (deviceInfos) {
            app.devices.gotDevices(deviceInfos);
        });
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
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
        }
        navigator.mediaDevices.getUserMedia(constraints)
            .then(function (stream) {
            app.setAsListener(false);
            if (!app.screen.onScreenMode()) {
                // @ts-ignore
                app.yourVideo.srcObject = stream;
            }
            app.localStream = stream;
            app.controls.initialiseStream();
            app.setStreamToPartners();
            if (first) {
                if (!app.called) {
                    app.callOther();
                }
                else {
                    app.reloadConnections();
                }
            }
        })
            .catch(function (err) {
            alert("Es kann leider nicht auf die Kamera zugegriffen werden! \nSie sind daher nur als Zuhörer dabei!");
            app.setAsListener(true);
            if (!app.called) {
                app.callOther();
            }
            console.log(err);
        });
    }
    callOther() {
        this.called = true;
        this.exchange.sendMessage({ 'call': this.yourId });
    }
    readMessage(sender, dataroom, msg) {
        if (app !== undefined && !this.closed) {
            console.log("Exchange message from: " + sender);
            console.log(msg);
            if (!(sender in app.partners) && (msg.call !== undefined || msg.sdp !== undefined)) {
                app.addPartner(sender);
            }
            if ((sender in app.partners) && app.partners[sender]) {
                var partnerConnection = app.partners[sender].connection;
                if (msg.call !== undefined) {
                    app.partners[sender].createOffer(true);
                }
                else if (msg.closing !== undefined) {
                    app.partners[sender].closeConnection();
                    delete app.partners[sender];
                }
                else if (msg.ice !== undefined) {
                    partnerConnection.addIceCandidate(new RTCIceCandidate(msg.ice));
                }
                else if (msg.sdp.type === "offer") {
                    app.partners[sender].createAnswer(msg.sdp);
                }
                else if (msg.sdp.type === "answer") {
                    partnerConnection.setRemoteDescription(new RTCSessionDescription(msg.sdp));
                }
            }
        }
    }
    addPartner(partnerId) {
        var cla = this;
        if (partnerId in app.partners) {
            this.partners[partnerId].closeConnection();
            delete this.partners[partnerId];
        }
        this.partners[partnerId] = null;
        this.partners[partnerId] = new _Partner_Partner__WEBPACK_IMPORTED_MODULE_1__.Partner(partnerId, this.exchange, this.devices, this.textchat, this.videogrid, this.partnerOnConnected, this.partnerOnConnectionClosed, this.partnerOnConnectionLosed);
        this.setStreamToPartner(this.partners[partnerId], true);
        this.videogrid.recalculateLayout();
    }
    partnerOnConnected(partner) {
        app.setStreamToPartner(partner);
    }
    partnerOnConnectionLosed(partner) {
    }
    partnerOnConnectionClosed(partner) {
        if (partner.id in app.partners) {
            delete this.partners[partner.id];
        }
    }
    setStreamToPartners() {
        for (var id in this.partners) {
            this.setStreamToPartner(this.partners[id]);
        }
    }
    reloadConnections() {
        for (var id in this.partners) {
            this.partners[id].reloadConnection();
        }
    }
    setStreamToPartner(partner, initial = false) {
        if (app.localStream) {
            var videoTrack = !app.screen.onScreenMode() ? app.localStream.getVideoTracks()[0] : app.localScreenStream.getVideoTracks()[0];
            var audioTrack = app.localStream.getAudioTracks()[0];
            app.setTrackToPartner(partner, app.localStream, videoTrack);
            app.setTrackToPartner(partner, app.localStream, audioTrack);
        }
        else if (app.localScreenStream) {
            var videoTrack = app.localScreenStream.getVideoTracks()[0];
            //var audioTrack = app.localScreenStream.getAudioTracks()[0];
            app.setTrackToPartner(partner, app.localScreenStream, videoTrack);
            //app.setTrackToPartner(partner, app.localScreenStream, audioTrack);
        }
        partner.sendMessage(app.userinfo.getUserInfo());
    }
    setTrackToPartner(partner, stream, track) {
        var sender = partner.connection.getSenders().find(function (s) {
            return s.track && track && s.track.kind == track.kind;
        });
        if (sender) {
            sender.replaceTrack(track);
        }
        else {
            partner.connection.addTrack(track, stream);
        }
    }
    sendMessageToAllPartners(message) {
        for (var id in this.partners) {
            if (this.partners[id]) {
                this.partners[id].sendMessage(message);
            }
        }
    }
    sidebarToogle(open) {
        $(".maincontainer").toggleClass("opensidebar");
        this.textchat.scrollToBottom();
        this.videogrid.recalculateLayout();
    }
    setAsListener(listener) {
        this.listener = listener;
        this.yourVideoElement.videoVueObject.listener = listener;
        this.partnerListElement.partnerListElementVueObject.listener = listener;
    }
    hangOut() {
        this.closed = true;
        this.exchange.sendMessage({ 'closing': this.yourId });
        this.exchange.closeConnection();
        for (var id in this.partners) {
            if (this.partners[id]) {
                this.partners[id].closeConnection();
            }
        }
    }
}
var app = new App();
app.run();


/***/ }),
/* 1 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Firebase": () => /* binding */ Firebase
/* harmony export */ });
class Firebase {
    constructor(room, yourId) {
        this.firebaseConfig = {
            apiKey: "AIzaSyBgaQ4Oi6fs93dJTaS1r_D5E1VAwfYfuRU",
            authDomain: "chat-f4460.firebaseapp.com",
            databaseURL: "https://chat-f4460-default-rtdb.europe-west1.firebasedatabase.app",
            projectId: "chat-f4460",
            storageBucket: "chat-f4460.appspot.com",
            messagingSenderId: "616248470443",
            appId: "1:616248470443:web:55307f2a3d26a11aa640ee",
            measurementId: "G-P11BZ3TF99"
        };
        this.room = room;
        this.yourId = yourId;
        firebase.initializeApp(this.firebaseConfig);
        firebase.analytics();
        this.database = firebase.database().ref();
    }
    sendMessage(data, receiver = 0) {
        console.log("Exchange message to: " + (receiver !== 0 ? receiver : 'all'));
        console.log(data);
        var msg = this.database.push({ room: this.room, sender: this.yourId, receiver: receiver, message: JSON.stringify(data) });
        msg.remove();
    }
    readMessage(data, cla) {
        var msg = JSON.parse(data.val().message);
        var sender = data.val().sender;
        var receiver = data.val().receiver;
        var dataroom = data.val().room;
        if (dataroom === cla.room && sender !== cla.yourId && (receiver == 0 || receiver == cla.yourId)) {
            cla.readCallback(sender, dataroom, msg);
        }
    }
    addReadEvent(callback) {
        this.readCallback = callback;
        let cla = this;
        this.database.on('child_added', function (data) {
            cla.readMessage(data, cla);
        });
    }
    closeConnection() {
        this.database.off();
    }
}


/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Partner": () => /* binding */ Partner
/* harmony export */ });
/* harmony import */ var _Communication_WebRTC__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var _Elements_Userinfo__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4);
/* harmony import */ var _Elements_Video__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(6);
/* harmony import */ var _Elements_PartnerListElement__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(7);




class Partner {
    constructor(id, exchange, devices, textchat, videogrid, onConnectedEvent, onConnectionClosedEvent, onConnectionLosedEvent) {
        this.connected = false;
        this.messages = Array();
        this.doReload = false;
        this.closed = false;
        this.gotTracks = false;
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
        var communication = new _Communication_WebRTC__WEBPACK_IMPORTED_MODULE_0__.WebRTC(this);
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
        partner.gotTracks = true;
    }
    ;
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
        setTimeout(function () {
            if (!partner.gotTracks && !partner.listener) {
                partner.reloadConnection();
            }
        }, 2000);
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
            else if (message.type === _Elements_Userinfo__WEBPACK_IMPORTED_MODULE_1__.Userinfo.userinfoMessageType && message.message.name != undefined) {
                partner.setName(message.message.name);
                partner.setMuted(message.message.muted);
                partner.setCameraOff(message.message.cameraOff);
                partner.setScreenSharing(message.message.screenSharing);
                partner.setListener(message.message.listener);
            }
        }
    }
    addVideoElement() {
        var cla = this;
        if (this.videoElement == undefined) {
            $("#video-area").append('<div class="video-item video-item-partner" id="video-item-' + this.id + '"><div class="video-wrap"><div class="video-inner-wrap"><video id="video-' + this.id + '" autoplay playsinline></video></div></div></div>');
            this.videoElement = document.getElementById('video-' + this.id);
            this.videoGridElement = new _Elements_Video__WEBPACK_IMPORTED_MODULE_2__.Video(document.getElementById('video-item-' + this.id), this);
            this.partnerListElement = new _Elements_PartnerListElement__WEBPACK_IMPORTED_MODULE_3__.PartnerListElement(this);
            this.videogrid.recalculateLayout();
        }
        setTimeout(function () {
            cla.setSinkId(cla.devices.devicesVueObject.sound);
        }, 1);
    }
}


/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "WebRTC": () => /* binding */ WebRTC
/* harmony export */ });
class WebRTC {
    constructor(partner) {
        this.servers = { 'iceServers': [{ 'urls': 'stun:stun.services.mozilla.com' }, { 'urls': 'stun:stun.l.google.com:19302' }] };
        this.partner = partner;
    }
    getPeerConnection() {
        var pc = new RTCPeerConnection(this.servers);
        this.setPCEvents(pc);
        return pc;
    }
    setPCEvents(pc) {
        let cla = this;
        pc.onicecandidate = function (event) {
            if (event.candidate) {
                cla.onicecandidateEvent(event.candidate, cla.partner);
            }
            else {
                console.log("Sent All Ice to " + cla.partner.id);
            }
        };
        // @ts-ignore
        pc.ontrack = function (event) {
            return cla.onaddtrackEvent(event.streams[0], cla.partner);
        };
        pc.oniceconnectionstatechange = function () {
            if (pc.iceConnectionState == 'disconnected') {
                cla.connectionLosedEvent(cla.partner);
            }
            else if (pc.iceConnectionState == 'connected') {
                cla.connectionEvent(cla.partner);
            }
        };
    }
    getDataChannel(pc) {
        let cla = this;
        var dataChannel = pc.createDataChannel("chat", { negotiated: true, id: 0 });
        dataChannel.onerror = function (error) {
            console.log(error);
        };
        dataChannel.onmessage = function (event) {
            cla.onMessageEvent(JSON.parse(event.data), cla.partner);
        };
        dataChannel.onclose = function (event) {
            console.log("Data Channel is diconnected!");
            //cla.connectionLosedEvent(cla.partner); 
        };
        return dataChannel;
    }
    addOnicecandidateEvent(callback) {
        this.onicecandidateEvent = callback;
    }
    addOnaddtrackEvent(callback) {
        this.onaddtrackEvent = callback;
    }
    addConnectionLosedEvent(callback) {
        this.connectionLosedEvent = callback;
    }
    addConnectionEvent(callback) {
        this.connectionEvent = callback;
    }
    addOnMessageEvent(callback) {
        this.onMessageEvent = callback;
    }
}


/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Userinfo": () => /* binding */ Userinfo
/* harmony export */ });
/* harmony import */ var _Utils_Cookie__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5);

class Userinfo {
    constructor(app) {
        var _a;
        this.nameCookie = 'name';
        this.app = app;
        this.app.yourName = (_a = _Utils_Cookie__WEBPACK_IMPORTED_MODULE_0__.Cookie.getCookie(this.nameCookie)) !== null && _a !== void 0 ? _a : null;
        this.initialElements();
    }
    initialElements() {
        var _a;
        let cla = this;
        this.userinfoVueObject = new Vue({
            el: '#userinfo',
            data: {
                name: (_a = _Utils_Cookie__WEBPACK_IMPORTED_MODULE_0__.Cookie.getCookie(cla.nameCookie)) !== null && _a !== void 0 ? _a : null
            },
            methods: {
                changeUserinfo: function () {
                    cla.app.sendMessageToAllPartners(cla.getUserInfo());
                    _Utils_Cookie__WEBPACK_IMPORTED_MODULE_0__.Cookie.setCookie(cla.nameCookie, this.name);
                    cla.app.yourName = this.name;
                }
            }
        });
    }
    getUserInfo() {
        return {
            type: Userinfo.userinfoMessageType, message: {
                name: this.userinfoVueObject.name,
                muted: !this.app.controls.controlsVueObject.microphoneOn,
                cameraOff: !this.app.controls.controlsVueObject.cameraOn,
                screenSharing: this.app.screen.onScreenMode(),
                listener: this.app.listener
            }
        };
    }
}
Userinfo.userinfoMessageType = 'userinfo';


/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Cookie": () => /* binding */ Cookie
/* harmony export */ });
class Cookie {
    /*
    * General utils for managing cookies in Typescript.
    */
    static setCookie(name, val) {
        const date = new Date();
        const value = val;
        // Set it expire in 1 year
        date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
        // Set it
        document.cookie = name + "=" + value + "; expires=" + date.toUTCString() + "; path=/";
    }
    static getCookie(name) {
        const value = "; " + document.cookie;
        const parts = value.split("; " + name + "=");
        if (parts.length == 2) {
            return parts.pop().split(";").shift();
        }
    }
    static deleteCookie(name) {
        const date = new Date();
        // Set it expire in -1 days
        date.setTime(date.getTime() + (-1 * 24 * 60 * 60 * 1000));
        // Set it
        document.cookie = name + "=; expires=" + date.toUTCString() + "; path=/";
    }
}


/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Video": () => /* binding */ Video
/* harmony export */ });
class Video {
    constructor(element, partner) {
        this.element = element;
        this.partner = partner;
        this.addCodeToVideoElement();
        this.setVueElement();
    }
    addCodeToVideoElement() {
        $(this.element).find(".video-wrap").append(`
            <div class="video-info-wrap" v-on:dblclick="expand" v-bind:class="{'cammeraoff': cameraOff  && !screenSharing}">
                <div class="video-name">{{name}} 
                <span v-bind:class="{'on': !listener}" class="listener fas fa-eye"></span>
                <span v-bind:class="{'on': !muted || listener}" class="microphone fas fa-microphone-slash"></span> 
                <span v-bind:class="{'on': !cameraOff || listener}" class="camera fas fa-video-slash"></span>
                <span v-bind:class="{'on': !screenSharing}" class="screen fas fa-desktop"></span>
                </div>
                <div v-on:click="expand" v-bind:class="{'fa-compress-arrows-alt': expanded, 'fa-expand-arrows-alt': !expanded}" class="expand fas"></div>
            </div>
        `);
    }
    setVueElement() {
        let cla = this;
        this.videoVueObject = new Vue({
            el: $(this.element).find(".video-info-wrap").get(0),
            data: {
                name: cla.partner ? cla.partner.getName() : "Du",
                expanded: false,
                muted: false,
                cameraOff: false,
                screenSharing: false,
                listener: false
            },
            methods: {
                expand: function () {
                    $(cla.element).toggleClass("big");
                    this.expanded = !this.expanded;
                }
            }
        });
    }
}


/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PartnerListElement": () => /* binding */ PartnerListElement
/* harmony export */ });
class PartnerListElement {
    constructor(partner) {
        this.partner = partner;
        this.addCodeToVideoElement();
        this.setVueElement();
    }
    addCodeToVideoElement() {
        $("#partnerlist ul").append(`
            <li id="partnerlistelement-${this.partner ? this.partner.id : 0}" v-bind:class="{'unconnected': !connected}">
                {{ name }} 
                <span v-bind:class="{'on': !listener}" class="listener fas fa-eye"></span>
                <span v-bind:class="{'on': !muted || listener}" class="microphone fas fa-microphone-slash"></span> 
                <span v-bind:class="{'on': !cameraOff || listener}" class="camera fas fa-video-slash"></span>
                <span v-bind:class="{'on': !screenSharing}" class="screen fas fa-desktop"></span>
            </li>
        `);
    }
    setVueElement() {
        let cla = this;
        this.partnerListElementVueObject = new Vue({
            el: "#partnerlistelement-" + (cla.partner ? cla.partner.id : 0),
            data: {
                name: cla.partner ? cla.partner.getName() : "Du",
                muted: false,
                connected: true,
                cameraOff: false,
                screenSharing: false,
                listener: false
            },
            methods: {}
        });
    }
}


/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Controls": () => /* binding */ Controls
/* harmony export */ });
/* harmony import */ var _Utils_Cookie__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5);

class Controls {
    constructor(app) {
        this.microphoneCookie = 'microphoneOn';
        this.cameraCookie = 'cameraOn';
        this.app = app;
        this.initialElements();
        this.setSidebarClickRemove();
    }
    initialElements() {
        let cla = this;
        this.controlsVueObject = new Vue({
            el: '#controls',
            data: {
                microphoneOn: _Utils_Cookie__WEBPACK_IMPORTED_MODULE_0__.Cookie.getCookie(cla.microphoneCookie) == 'false' ? false : true,
                cameraOn: _Utils_Cookie__WEBPACK_IMPORTED_MODULE_0__.Cookie.getCookie(cla.cameraCookie) == 'false' ? false : true,
                hangouted: false,
                screenOn: false,
                optionOn: false
            },
            methods: {
                toogleMicrophone: function () {
                    this.microphoneOn = !this.microphoneOn;
                    _Utils_Cookie__WEBPACK_IMPORTED_MODULE_0__.Cookie.setCookie(cla.microphoneCookie, this.microphoneOn);
                    cla.toogleStreamMicrophone(false);
                    cla.app.sendMessageToAllPartners(cla.app.userinfo.getUserInfo());
                },
                toogleCamera: function () {
                    this.cameraOn = !this.cameraOn;
                    _Utils_Cookie__WEBPACK_IMPORTED_MODULE_0__.Cookie.setCookie(cla.cameraCookie, this.cameraOn);
                    cla.toogleStreamCamera();
                    cla.app.sendMessageToAllPartners(cla.app.userinfo.getUserInfo());
                }, hangOut: function () {
                    if (!this.hangouted) {
                        cla.hangOut();
                        this.hangouted = true;
                    }
                    else {
                        location.hash = cla.app.room;
                        location.reload();
                    }
                }, toogleScreen: function () {
                    if (cla.app.screen.onScreenMode()) {
                        cla.app.screen.stopScreen();
                    }
                    else {
                        cla.app.screen.startScreen();
                    }
                }, toogleOption: function () {
                    this.optionOn = !this.optionOn;
                    cla.toogleOption();
                }
            }
        });
        this.setMutedIcon();
        this.setCameraOffIcon();
        //tabs
        $('#sidebar .tabs .tabs-header > *:first').addClass('active');
        $('#sidebar .tabs .tabs-content > *:first').addClass('active');
        $('#sidebar .tabs .tabs-header > *').on('click', function () {
            var t = $(this).attr('tab');
            cla.activateSidebarTab(t);
        });
    }
    activateSidebarTab(type) {
        $('#sidebar .tabs .tabs-header > *').removeClass('active');
        $('#sidebar .tabs .tabs-header > [tab=' + type + '] ').addClass('active');
        $('#sidebar .tabs .tabs-content > *').removeClass('active');
        $('#sidebar .tabs .tabs-content > #tab-' + type).addClass('active');
    }
    initialiseStream() {
        this.toogleStreamMicrophone(false);
        this.toogleStreamCamera(false);
    }
    toogleStreamMicrophone(changeCamera = true) {
        if (this.app.localStream !== undefined) {
            this.app.localStream.getAudioTracks()[0].enabled = this.controlsVueObject.microphoneOn;
            if (changeCamera && this.controlsVueObject.microphoneOn) {
                this.app.initialCamera();
            }
        }
        this.setMutedIcon();
    }
    toogleStreamCamera(changeCamera = true) {
        if (this.app.localStream !== undefined) {
            this.app.localStream.getVideoTracks()[0].enabled = this.controlsVueObject.cameraOn;
            if (changeCamera && this.controlsVueObject.cameraOn) {
                this.app.initialCamera();
            }
        }
        this.setCameraOffIcon();
    }
    setMutedIcon() {
        this.app.yourVideoElement.videoVueObject.muted = !this.controlsVueObject.microphoneOn;
        this.app.partnerListElement.partnerListElementVueObject.muted = !this.controlsVueObject.microphoneOn;
    }
    setCameraOffIcon() {
        this.app.yourVideoElement.videoVueObject.cameraOff = !this.controlsVueObject.cameraOn;
        this.app.partnerListElement.partnerListElementVueObject.cameraOff = !this.controlsVueObject.cameraOn;
    }
    toogleOption() {
        this.app.sidebarToogle(this.controlsVueObject.optionOn);
    }
    setSidebarClickRemove() {
        var cla = this;
        $("#clickbackground").on("click", function () {
            if (cla.controlsVueObject.optionOn) {
                cla.controlsVueObject.toogleOption();
            }
        });
    }
    hangOut() {
        this.app.hangOut();
    }
}


/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Screen": () => /* binding */ Screen
/* harmony export */ });
class Screen {
    constructor(app) {
        this.screenOn = false;
        this.app = app;
    }
    startScreen() {
        this.initialScreen();
    }
    stopScreen(closed = false) {
        this.screenOn = false;
        if (this.onScreenMode && !closed) {
            this.app.localScreenStream.getTracks().forEach(track => track.stop());
        }
        this.app.controls.controlsVueObject.screenOn = false;
        // @ts-ignore
        this.app.yourVideo.srcObject = this.app.localStream;
        this.app.setStreamToPartners();
        this.app.yourVideoElement.videoVueObject.screenSharing = false;
        this.app.partnerListElement.partnerListElementVueObject.screenSharing = false;
        this.app.sendMessageToAllPartners(this.app.userinfo.getUserInfo());
    }
    initialScreen() {
        var cal = this;
        if (!this.app.localScreenStream || !this.app.localScreenStream.active) {
            // @ts-ignore
            navigator.mediaDevices.getDisplayMedia()
                .then(function (stream) {
                cal.screenOn = true;
                // @ts-ignore
                cal.app.yourVideo.srcObject = stream;
                cal.app.localScreenStream = stream;
                cal.app.controls.controlsVueObject.screenOn = true;
                cal.app.setStreamToPartners();
                if (!cal.app.localStream) {
                    cal.app.reloadConnections();
                }
                cal.app.localScreenStream.getTracks()[0].onended = function () {
                    cal.stopScreen(true);
                };
                cal.app.yourVideoElement.videoVueObject.screenSharing = true;
                cal.app.partnerListElement.partnerListElementVueObject.screenSharing = true;
                cal.app.sendMessageToAllPartners(cal.app.userinfo.getUserInfo());
            });
        }
        else {
            // @ts-ignore
            this.app.yourVideo.srcObject = this.app.localScreenStream;
        }
    }
    onScreenMode() {
        if (this.app.localScreenStream && this.app.localScreenStream.active && this.screenOn) {
            return true;
        }
        return false;
    }
}


/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Devices": () => /* binding */ Devices
/* harmony export */ });
/* harmony import */ var _Utils_Cookie__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5);

class Devices {
    constructor(app) {
        this.audioCookie = 'audio';
        this.videoCookie = 'video';
        this.soundCookie = 'sound';
        this.audioDevices = {};
        this.videoDevices = {};
        this.soundDevices = {};
        this.app = app;
        this.setDeviceElements();
    }
    gotDevices(deviceInfos) {
        for (let i = 0; i !== deviceInfos.length; ++i) {
            const deviceInfo = deviceInfos[i];
            var value = deviceInfo.deviceId;
            if (deviceInfo.kind === 'audioinput') {
                var text = deviceInfo.label || `microphone`;
                this.audioDevices[value] = text;
            }
            else if (deviceInfo.kind === 'audiooutput') {
                var text = deviceInfo.label || `speaker`;
                this.soundDevices[value] = text;
            }
            else if (deviceInfo.kind === 'videoinput') {
                var text = deviceInfo.label || `camera`;
                this.videoDevices[value] = text;
            }
            else {
                console.log('Some other kind of source/device: ', deviceInfo);
            }
        }
        this.setDeviceElements();
        this.app.initialCamera(true);
    }
    setDeviceElements() {
        var cla = this;
        if (!this.devicesVueObject) {
            this.devicesVueObject = new Vue({
                el: '#devices',
                data: {
                    audio: null,
                    audiooptions: {},
                    video: null,
                    videooptions: {},
                    sound: null,
                    soundoptions: {}
                },
                methods: {
                    onChange() {
                        _Utils_Cookie__WEBPACK_IMPORTED_MODULE_0__.Cookie.setCookie(cla.audioCookie, this.audio);
                        _Utils_Cookie__WEBPACK_IMPORTED_MODULE_0__.Cookie.setCookie(cla.videoCookie, this.video);
                        _Utils_Cookie__WEBPACK_IMPORTED_MODULE_0__.Cookie.setCookie(cla.soundCookie, this.sound);
                        cla.app.initialCamera();
                        cla.attachSinkId();
                    }
                }
            });
        }
        this.devicesVueObject.audio = this.getDefaultDevice(cla.audioDevices, this.audioCookie);
        this.devicesVueObject.audiooptions = cla.audioDevices;
        this.devicesVueObject.video = this.getDefaultDevice(cla.videoDevices, this.videoCookie);
        this.devicesVueObject.videooptions = cla.videoDevices;
        this.devicesVueObject.sound = this.getDefaultDevice(cla.soundDevices, this.soundCookie);
        this.devicesVueObject.soundoptions = cla.soundDevices;
    }
    getDefaultDevice(list, cookieKey) {
        var value = _Utils_Cookie__WEBPACK_IMPORTED_MODULE_0__.Cookie.getCookie(cookieKey);
        if (value in list) {
            return value;
        }
        if (Object.keys(list).length !== 0) {
            return Object.keys(list)[0];
        }
        return null;
    }
    attachSinkId() {
        // @ts-ignore
        if (typeof this.app.yourVideo.sinkId !== 'undefined') {
            for (var id in this.app.partners) {
                this.app.partners[id].setSinkId(this.devicesVueObject.sound);
            }
        }
        else {
            console.warn('Browser does not support output device selection.');
        }
    }
}


/***/ }),
/* 11 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Textchat": () => /* binding */ Textchat
/* harmony export */ });
/* harmony import */ var _Database_IndexedDB__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(12);

class Textchat {
    constructor(app) {
        this.dbVersion = 1;
        this.textchatMessageType = 'textchat';
        this.textchatDatabaseName = 'chat';
        this.textchatDatabaseObjectName = 'textchat';
        this.textchatMessageTypeText = 'text';
        this.textchatMessageTypeImage = 'image';
        this.textchatMaxImageSize = 800;
        this.app = app;
        this.initialElements();
        this.initialDatabase();
        var cla = this;
    }
    initialElements() {
        let cla = this;
        this.textchatVueObject = new Vue({
            el: '#textchat',
            data: {
                message: "",
                result: "",
                extrainfo: "",
                extrainfoVisible: false,
                image: null
            },
            methods: {
                sendMessage: function () {
                    if (this.image) {
                        var message = {
                            image: {
                                image: this.image,
                                text: this.message
                            }
                        };
                        var data = { type: cla.textchatMessageType, message: message };
                        if (cla.checkSize(data)) {
                            cla.app.sendMessageToAllPartners(data);
                            cla.addMessage("Du", message.image, new Date(), true, cla.textchatMessageTypeImage);
                        }
                        else {
                            alert("Datei ist zu groß für den Versand, die Datei darf nur 256kb groß sein!");
                            return;
                        }
                    }
                    else if (this.message) {
                        cla.app.sendMessageToAllPartners({ type: cla.textchatMessageType, message: { text: this.message } });
                        cla.addMessage("Du", this.message, new Date(), true);
                    }
                    this.image = null;
                    this.extrainfoVisible = false;
                    this.message = "";
                },
                addfile: function (e) {
                    var vue = this;
                    var fileList = e.target.files;
                    if (!fileList.length)
                        return;
                    let reader = new FileReader();
                    if (fileList[0] && fileList[0].type.match(/image.*/)) {
                        reader.onload = (readerEvent) => {
                            /*vue.image = reader.result.toString();
                            cla.setImageToExtra(vue.image);*/
                            var image = new Image();
                            image.onload = function (imageEvent) {
                                var canvas = document.createElement('canvas'), max_size = cla.textchatMaxImageSize, width = image.width, height = image.height;
                                if (width > height) {
                                    if (width > max_size) {
                                        height *= max_size / width;
                                        width = max_size;
                                    }
                                }
                                else {
                                    if (height > max_size) {
                                        width *= max_size / height;
                                        height = max_size;
                                    }
                                }
                                canvas.width = width;
                                canvas.height = height;
                                canvas.getContext('2d').drawImage(image, 0, 0, width, height);
                                var dataUrl = canvas.toDataURL('image/jpeg');
                                cla.setImageToExtra(dataUrl);
                                vue.image = dataUrl;
                            };
                            image.src = readerEvent.target.result.toString();
                        };
                        reader.readAsDataURL(fileList[0]);
                    }
                    e.target.value = "";
                },
                closeExtra: function () {
                    this.image = null;
                    this.extrainfoVisible = false;
                }
            }
        });
    }
    initialDatabase() {
        this.database = new _Database_IndexedDB__WEBPACK_IMPORTED_MODULE_0__.IndexedDB();
        this.databaseStructure = {
            [this.textchatDatabaseObjectName]: {
                name: this.textchatDatabaseObjectName,
                keyPath: 'id',
                autoIncrement: true,
                elements: {
                    room: {
                        name: 'room',
                        unique: false
                    },
                    partnerName: {
                        name: 'partnerName',
                        unique: false
                    },
                    date: {
                        name: 'date',
                        unique: false
                    },
                    self: {
                        name: 'self',
                        unique: false
                    },
                    message: {
                        name: 'message',
                        unique: false
                    },
                    type: {
                        name: 'type',
                        unique: false
                    }
                }
            }
        };
        this.database.initDatabase(this.textchatDatabaseName, this.dbVersion, this.databaseStructure, function (success, caller) {
            if (success) {
                caller.loadMessagesFromDB();
            }
            else {
                console.log("Cannot create DB!");
            }
        }, this);
    }
    loadMessagesFromDB() {
        var query = {
            element: {
                name: 'room',
                unique: false
            },
            value: this.app.room
        };
        this.database.read(this.databaseStructure[this.textchatDatabaseObjectName], query, function (success, data, caller) {
            if (success) {
                for (var i = 0; i < data.length; i++) {
                    caller.addMessageToChat(data[i].partnerName, data[i].message, data[i].date, data[i].self, data[i].type);
                }
            }
            else {
                console.log("Cannot read message to DB!");
            }
        }, this);
    }
    addNewPartnerMessageToChat(message, partner) {
        if (message.text !== undefined) {
            this.addMessage(partner.getName(), message.text);
        }
        else if (message.image !== undefined) {
            this.addMessage(partner.getName(), message.image, new Date(), false, this.textchatMessageTypeImage);
        }
    }
    addMessage(sender, message, datetime = new Date(), self = false, type = this.textchatMessageTypeText) {
        this.addMessageToChat(sender, message, datetime, self, type);
        var data = {
            room: this.app.room,
            partnerName: sender,
            date: datetime,
            self: self,
            message: message,
            type: type
        };
        this.database.add(this.databaseStructure[this.textchatDatabaseObjectName], data, function (success, caller) {
            if (!success) {
                console.log("Cannot add message to DB!");
            }
        }, this);
    }
    addMessageToChat(sender, message, datetime = new Date(), self = false, type = this.textchatMessageTypeText) {
        if (type === this.textchatMessageTypeText) {
            this.addTextToChat(sender, message, datetime, self);
        }
        else if (type === this.textchatMessageTypeImage) {
            this.addImageToChat(sender, message, datetime, self);
        }
    }
    addTextToChat(sender, message, datetime = new Date(), self = false) {
        var side = self ? "right" : "left";
        const msgHTML = `
            <div class="msg ${side}-msg">
            <div class="msg-bubble">
                <div class="msg-info">
                    <div class="msg-info-name">${sender}</div>
                    <div class="msg-info-time">${this.formatDate(datetime)}</div>
                </div>

                <div class="msg-text">${this.formatMessage(message)}</div>
            </div>
            </div>
        `;
        $("#textchat .msger-chat").append(msgHTML);
        this.scrollToBottom();
    }
    addImageToChat(sender, message, datetime = new Date(), self = false) {
        var cla = this;
        var side = self ? "right" : "left";
        const msgHTML = `
            <div class="msg ${side}-msg">
            <div class="msg-bubble">
                <div class="msg-info">
                    <div class="msg-info-name">${sender}</div>
                    <div class="msg-info-time">${this.formatDate(datetime)}</div>
                </div>
                <div class="msg-image"><img src="${message.image}"/></div>
                <div class="msg-text">${this.formatMessage(message.text)}</div>
            </div>
            </div>
        `;
        $("#textchat .msger-chat").append(msgHTML);
        setTimeout(function () {
            cla.scrollToBottom();
        }, 100);
        $("#textchat img").off();
        $("#textchat img").on("click", function () {
            cla.app.lightbox.addImage($(this).attr("src"));
        });
    }
    setImageToExtra(image) {
        this.textchatVueObject.extrainfo = '<img src="' + image + '"/>';
        this.textchatVueObject.extrainfoVisible = true;
    }
    scrollToBottom() {
        $("#textchat .msger-chat").scrollTop($("#textchat .msger-chat").get(0).scrollHeight);
    }
    formatMessage(message) {
        var urlRegex = /(https?:\/\/[^\s]+)/g;
        message = message.replace(urlRegex, function (url) {
            return '<a target="_blank" href="' + url + '">' + url + '</a>';
        });
        message = message.replaceAll("\n", "<br>");
        return message;
    }
    formatDate(date) {
        const h = "0" + date.getHours();
        const m = "0" + date.getMinutes();
        const d = "0" + date.getDate();
        const mo = "0" + (date.getMonth() + 1);
        const y = date.getFullYear();
        const currentDate = new Date();
        if (date.getDate() == currentDate.getDate() && date.getMonth() == currentDate.getMonth() && date.getFullYear() == currentDate.getFullYear()) {
            return `${h.slice(-2)}:${m.slice(-2)}`;
        }
        return `${d.slice(-2)}.${mo.slice(-2)}.${y} ${h.slice(-2)}:${m.slice(-2)}`;
    }
    checkSize(data) {
        var dataJson = JSON.stringify(data);
        var size = new Blob([dataJson]).size;
        console.log("File size: " + size + "kb");
        return size < 262000;
    }
}


/***/ }),
/* 12 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "IndexedDB": () => /* binding */ IndexedDB
/* harmony export */ });
class IndexedDB {
    constructor() {
        if (!window.indexedDB) {
            window.alert("Your browser doesn't support a stable version of IndexedDB.");
        }
    }
    initDatabase(database, version = 1, structur, callback, caller) {
        var cla = this;
        this.request = window.indexedDB.open(database, version);
        this.request.onerror = function (event) {
            console.log("Error to connect to DB!");
        };
        this.request.onupgradeneeded = function (event) {
            cla.db = event.target.result;
            for (var objectname in structur) {
                cla.createObject(structur[objectname]);
            }
        };
        this.request.onsuccess = function (event) {
            cla.db = cla.request.result;
            callback(true, caller);
        };
    }
    add(object, data, callback, caller) {
        var request = this.db.transaction([object.name], "readwrite")
            .objectStore(object.name)
            .add(data);
        request.onsuccess = function (event) {
            callback(true, caller);
        };
        request.onerror = function (event) {
            callback(false, caller);
        };
    }
    read(object, query, callback, caller) {
        var store = this.db.transaction(object.name, 'readonly').objectStore(object.name);
        if (query) {
            var cursorQuery = store.index(query.element.name).getAll(query.value);
        }
        else {
            var cursorQuery = store.getAll();
        }
        cursorQuery.onerror = ev => {
            callback(false, null, caller);
        };
        cursorQuery.onsuccess = ev => {
            callback(true, cursorQuery.result, caller);
        };
    }
    createObject(object) {
        var objectStore = this.db.createObjectStore(object.name, { keyPath: object.keyPath, autoIncrement: true });
        for (var elementName in object.elements) {
            this.createElement(object.elements[elementName], objectStore);
        }
    }
    createElement(element, objectStore) {
        objectStore.createIndex(element.name, element.name, { unique: element.unique });
    }
}


/***/ }),
/* 13 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Videogrid": () => /* binding */ Videogrid
/* harmony export */ });
class Videogrid {
    recalculateLayout() {
        const gallery = document.getElementById("video-area");
        const aspectRatio = 4 / 3;
        const screenWidth = gallery.offsetWidth;
        const screenHeight = gallery.offsetHeight;
        const videoCount = $(gallery).find(".video-item:not(.unconnected)").length;
        // or use this nice lib: https://github.com/fzembow/rect-scaler
        function calculateLayout(containerWidth, containerHeight, videoCount, aspectRatio) {
            let bestLayout = {
                area: 0,
                cols: 0,
                rows: 0,
                width: 0,
                height: 0
            };
            // brute-force search layout where video occupy the largest area of the container
            for (let cols = 1; cols <= videoCount; cols++) {
                const rows = Math.ceil(videoCount / cols);
                const hScale = containerWidth / (cols * aspectRatio);
                const vScale = containerHeight / rows;
                let width;
                let height;
                if (hScale <= vScale) {
                    width = Math.floor(containerWidth / cols);
                    height = Math.floor(width / aspectRatio);
                }
                else {
                    height = Math.floor(containerHeight / rows);
                    width = Math.floor(height * aspectRatio);
                }
                const area = width * height;
                if (area > bestLayout.area) {
                    bestLayout = {
                        area,
                        width,
                        height,
                        rows,
                        cols
                    };
                }
            }
            return bestLayout;
        }
        const { width, height, cols } = calculateLayout(screenWidth, screenHeight, videoCount, aspectRatio);
        gallery.style.setProperty("--width", width + "px");
        gallery.style.setProperty("--height", height + "px");
        gallery.style.setProperty("--cols", cols + "");
    }
    init() {
        var cla = this;
        window.addEventListener("resize", this.recalculateLayout);
        this.recalculateLayout();
        setInterval(function () {
            cla.recalculateLayout();
        }, 2000);
    }
}


/***/ }),
/* 14 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Lightbox": () => /* binding */ Lightbox
/* harmony export */ });
class Lightbox {
    constructor(app) {
        this.app = app;
        this.setLightboxElements();
    }
    setLightboxElements() {
        var cla = this;
        this.lightboxVueObject = new Vue({
            el: '#lightbox',
            data: {
                image: null,
                closed: true
            },
            methods: {
                closeLightbox() {
                    this.closed = true;
                }
            }
        });
    }
    addImage(src) {
        this.lightboxVueObject.image = src;
        this.lightboxVueObject.closed = false;
    }
}


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	// startup
/******/ 	// Load entry module
/******/ 	__webpack_require__(0);
/******/ 	// This entry module used 'exports' so it can't be inlined
/******/ })()
;
//# sourceMappingURL=bundle.js.map