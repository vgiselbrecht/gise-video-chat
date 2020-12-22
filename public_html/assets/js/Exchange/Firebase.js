export class Firebase {
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
    sendMessage(data) {
        var msg = this.database.push({ room: this.room, sender: this.yourId, message: data });
        msg.remove();
    }
    readMessage(data, cla) {
        var msg = JSON.parse(data.val().message);
        var sender = data.val().sender;
        var dataroom = data.val().room;
        if (dataroom === cla.room && sender !== cla.yourId) {
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
}
//# sourceMappingURL=Firebase.js.map