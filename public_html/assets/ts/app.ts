export{}

import { IExchange } from "./Exchange/IExchange.js";
import { Firebase } from "./Exchange/Firebase.js";
import { ICommunication } from "./Communication/ICommunication.js";
import { WebRTC } from "./Communication/WebRTC.js";

class App{

    room: string = "default";
    yourId: number = Math.floor(Math.random()*1000000000);
    exchange: IExchange;
    communication: ICommunication;
    yourVideo;
    friendsVideo;
    friendsConnection: RTCPeerConnection;

    constructor(){
        this.yourVideo = document.getElementById("yourVideo");
        this.friendsVideo = document.getElementById("friendsVideo");
        this.exchange = new Firebase(this.room, this.yourId);
        this.exchange.addReadEvent(this.readMessage);
        this.communication = new WebRTC();
        this.communication.addOnaddstreamEvent(this.onaddstream);
        this.communication.addOnicecandidateEvent(this.onicecandidate);
        this.friendsConnection = this.communication.getPeerConnection();
    }

    run(){ 
        this.initialCamera();
        setTimeout(function() {
            app.CallOther();  
        }, 1000);
        $("#callbutton").on('click', function(){
            app.CallOther(); 
        });
        
    }

    initialCamera() {
        navigator.mediaDevices.getUserMedia({audio:true, video:true})
          .then(function(stream){
              // @ts-ignore
              app.yourVideo.srcObject = stream;
              // @ts-ignore
              app.friendsConnection.addStream(stream);
          });
      }
      
    CallOther() {
        this.friendsConnection.createOffer()
          .then(function(offer){
              return app.friendsConnection.setLocalDescription(offer);
           })
          .then(function(){
            app.exchange.sendMessage(JSON.stringify({'sdp': app.friendsConnection.localDescription}));
           });
      }

    readMessage(sender: number, dataroom: string, msg) {
        if (msg.ice !== undefined)
        {
            app.friendsConnection.addIceCandidate(new RTCIceCandidate(msg.ice));
        }
        else if (msg.sdp.type === "offer")
        {
            app.friendsConnection.setRemoteDescription(new RTCSessionDescription(msg.sdp)) 
                .then(function(){ 
                    return app.friendsConnection.createAnswer();
                })
                .then(function(answer){
                    return app.friendsConnection.setLocalDescription(answer);
                })
                .then(function(){
                    app.exchange.sendMessage(JSON.stringify({'sdp': app.friendsConnection.localDescription}));
                });
        }
        else if (msg.sdp.type === "answer")
        {
            app.friendsConnection.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        }
    }

    onicecandidate(candidate: any) {
        app.exchange.sendMessage(JSON.stringify({'ice': candidate}));
    };
    
    // @ts-ignore
    onaddstream(stream: any) { 
        // @ts-ignore
        app.friendsVideo.srcObject = stream;
    };

}

var app = new App();
app.run();