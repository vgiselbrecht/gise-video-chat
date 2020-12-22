export interface ICommunication{

    getPeerConnection(): RTCPeerConnection;

    addOnicecandidateEvent(callback: (candidate: any) => void): void;

    addOnaddstreamEvent(callback: (stream: any) => void): void;

}