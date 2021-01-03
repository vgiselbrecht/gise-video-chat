
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

    roomDatabase: any;
    ownDatabase: any;
    partnerDatbases: {} = {};
    room: string;
    yourId: number;
    isAuthenticated: boolean = false;
    readCallback: (sender: number, dataroom: string, msg: any) => void;

    constructor(room: string, yourId: number, authenticated: () => void){
        var cla = this;
        this.room = room;
        this.yourId = yourId;
        firebase.initializeApp(this.firebaseConfig);
        firebase.analytics();
        firebase.auth().signInAnonymously()
            .then(() => {
                cla.roomDatabase = firebase.database().ref('rooms/' + room + "/partners/all");
                cla.ownDatabase = firebase.database().ref('rooms/' + room + "/partners/" + yourId);
                cla.isAuthenticated = true;
                authenticated();
            })
            .catch((error) => {
                console.log(error);
                alert("Autentifizierungsfehler bei Firebase!");
            });
    }

    
    sendMessage(data: any, receiver: number = 0): void{
        var cla = this;
        if(cla.isAuthenticated){
            cla.sendMessageInner(data, receiver);
        } else{
            var authIntervall = setInterval(function(){
                if(cla.isAuthenticated){
                    cla.sendMessageInner(data, receiver);
                    clearInterval(authIntervall);
                }
            }, 100)
        }
    }

    sendMessageInner(data: any, receiver: number = 0){
        console.log("Exchange message to: " + (receiver !== 0 ? receiver : 'all'))
        console.log(data)
        var ref = this.getDatabaseRef(receiver);
        var msg = ref.push({ room: this.room, sender: this.yourId, receiver: receiver, message: JSON.stringify(data) });
        msg.remove();
    }

    readMessage(data, cla) {
        if(data.val().message){
            var msg = JSON.parse(data.val().message);
            var sender = data.val().sender;
            var receiver = data.val().receiver;
            var dataroom = data.val().room;
            if (dataroom === cla.room && sender !== cla.yourId && (receiver == 0 || receiver == cla.yourId)) {
                cla.readCallback(sender, dataroom, msg);
            }
        } else {
            console.log("Wrong data from firebase!: ");
            console.log(data.val());
        }
    }
 
    addReadEvent(callback: (sender: number, dataroom: string, msg: any) => void): void{
        this.readCallback = callback;
        let cla = this;
        this.roomDatabase.on('child_added', function(data: any) {
            cla.readMessage(data, cla)
        });
        this.ownDatabase.on('child_added', function(data: any) {
            cla.readMessage(data, cla)
        });
    }

    closeConnection(): void{
        this.roomDatabase.off();
        this.ownDatabase.off();
        for(var receiverid in this.partnerDatbases){
            this.partnerDatbases[receiverid].off();
        }
    }

    getDatabaseRef(receiver: number = 0){
        if(receiver === 0){
            return this.roomDatabase;
        }
        if(receiver in this.partnerDatbases){
            return this.partnerDatbases[receiver];
        }
        this.partnerDatbases[receiver] = firebase.database().ref('rooms/' + this.room + "/partners/" + receiver);
        return this.partnerDatbases[receiver];
    }

}