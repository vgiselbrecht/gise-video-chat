
import { IExchange } from "./IExchange";

declare var firebase: any; 

export class Firebase implements IExchange{

    firebaseConfig = { 
        apiKey: "AIzaSyBgaQ4Oi6fs93dJTaS1r_D5E1VAwfYfuRU",
        authDomain: "chat-f4460.firebaseapp.com",
        databaseURL: "https://chat-f4460-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "chat-f4460",
        storageBucket: "chat-f4460.appspot.com",
        messagingSenderId: "616248470443",
        appId: "1:616248470443:web:55307f2a3d26a11aa640ee",
        measurementId: "G-P11BZ3TF99"
    };

    database: any;
    room: string;
    yourId: number;
    readCallback: (sender: number, dataroom: string, msg: any) => void;

    constructor(room: string, yourId: number){
        this.room = room;
        this.yourId = yourId;
        firebase.initializeApp(this.firebaseConfig);
        firebase.analytics();
        this.database = firebase.database().ref();
    }

    
    sendMessage(data: any, receiver: number = 0): void{
        console.log("Exchange message to: " + (receiver !== 0 ? receiver : 'all'))
        console.log(data)
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
 
    addReadEvent(callback: (sender: number, dataroom: string, msg: any) => void): void{
        this.readCallback = callback;
        let cla = this;
        this.database.on('child_added', function(data: any) {
            cla.readMessage(data, cla)
        });
    }

    closeConnection(): void{
        this.database.off();
    }

}