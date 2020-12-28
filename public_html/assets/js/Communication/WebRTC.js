export class WebRTC {
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
            console.log("Error:", error);
        };
        dataChannel.onmessage = function (event) {
            cla.onMessageEvent(JSON.parse(event.data), cla.partner);
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
//# sourceMappingURL=WebRTC.js.map