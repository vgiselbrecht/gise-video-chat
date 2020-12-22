export class WebRTC {
    constructor() {
        this.servers = { 'iceServers': [{ 'urls': 'stun:stun.services.mozilla.com' }, { 'urls': 'stun:stun.l.google.com:19302' }] };
    }
    getPeerConnection() {
        var pc = new RTCPeerConnection(this.servers);
        let cla = this;
        pc.onicecandidate = function (event) {
            if (event.candidate) {
                cla.onicecandidateEvent(event.candidate);
            }
            else {
                console.log("Sent All Ice");
            }
        };
        // @ts-ignore
        pc.onaddstream = function (event) {
            return cla.onaddstreamEvent(event.stream);
        };
        return pc;
    }
    addOnicecandidateEvent(callback) {
        this.onicecandidateEvent = callback;
    }
    addOnaddstreamEvent(callback) {
        this.onaddstreamEvent = callback;
    }
}
//# sourceMappingURL=WebRTC.js.map