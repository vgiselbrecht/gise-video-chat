export class WebRTC {
    constructor(partner) {
        this.servers = { 'iceServers': [{ 'urls': 'stun:stun.services.mozilla.com' }, { 'urls': 'stun:stun.l.google.com:19302' }] };
        this.partner = partner;
    }
    getPeerConnection() {
        var pc = new RTCPeerConnection(this.servers);
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
        };
        return pc;
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
}
//# sourceMappingURL=WebRTC.js.map