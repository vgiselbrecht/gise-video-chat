//Create an account on Firebase, and use the credentials they give you in place of the following
var firebaseConfig = {
    apiKey: "AIzaSyBgaQ4Oi6fs93dJTaS1r_D5E1VAwfYfuRU",
    authDomain: "chat-f4460.firebaseapp.com",
    databaseURL: "https://chat-f4460-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "chat-f4460",
    storageBucket: "chat-f4460.appspot.com",
    messagingSenderId: "616248470443",
    appId: "1:616248470443:web:55307f2a3d26a11aa640ee",
    measurementId: "G-P11BZ3TF99"
};

firebase.initializeApp(firebaseConfig);
firebase.analytics();

var room = "default";
var database = firebase.database().ref();
var yourVideo = document.getElementById("yourVideo");
var friendsVideo = document.getElementById("friendsVideo");
var yourId = Math.floor(Math.random()*1000000000);
var servers = {'iceServers': [{'urls': 'stun:stun.services.mozilla.com'}, {'urls': 'stun:stun.l.google.com:19302'}]};
var pc = new RTCPeerConnection(servers);
pc.onicecandidate = function(event) {
    if(event.candidate){
        sendMessage(yourId, JSON.stringify({'ice': event.candidate}));
    }else{
        console.log("Sent All Ice");
    }
};
pc.onaddstream = function(event) { 
    friendsVideo.srcObject = event.stream;
};

function sendMessage(senderId, data) {
    var msg = database.push({ room: room, sender: senderId, message: data });
    msg.remove();
}

function readMessage(data) {
    var msg = JSON.parse(data.val().message);
    var sender = data.val().sender;
    var dataroom = data.val().room;
    if (dataroom === room && sender !== yourId) {
        if (msg.ice !== undefined)
        {
            pc.addIceCandidate(new RTCIceCandidate(msg.ice));
        }
        else if (msg.sdp.type === "offer")
        {
            pc.setRemoteDescription(new RTCSessionDescription(msg.sdp)) 
              .then(function(){ 
                  return pc.createAnswer();
                })
              .then(function(answer){
                  return pc.setLocalDescription(answer);
                })
              .then(function(){
                  sendMessage(yourId, JSON.stringify({'sdp': pc.localDescription}));
                });
        }
        else if (msg.sdp.type === "answer")
        {
            pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        }
    }
}

database.on('child_added', readMessage);

function showMyFace() {
  navigator.mediaDevices.getUserMedia({audio:true, video:true})
    .then(function(stream){
        yourVideo.srcObject = stream;
        pc.addStream(stream);
    });
}

function showFriendsFace() {
  pc.createOffer()
    .then(function(offer){
        return pc.setLocalDescription(offer);
     })
    .then(function(){
        sendMessage(yourId, JSON.stringify({'sdp': pc.localDescription}));
     });
}