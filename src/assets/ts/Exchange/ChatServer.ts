import { IExchange } from "./IExchange";
import config from "../../../config.json"
import { Settings } from "../Utils/Settings";

declare var io: any; 

export class ChatServer implements IExchange{

    room: string;
    yourId: number;
    socket: any;
    connected: boolean = false;

    constructor(room: string, yourId: number){
        var cla = this;
        this.room = room;
        this.yourId = yourId;
        this.socket = io(Settings.getValue(config, "exchangeServices.chat-server.host"));
        this.socket.on("connect", () => {
            cla.connected = true;
            console.log("Connected to chat server");
            this.socket.emit('login', {room: this.room, id: this.yourId});
        });
        this.socket.on("disconnect", () => {
            cla.connected = false;
        });
    }

    sendMessage(data: any, receiver: number = 0): void{
        var cla = this;
        if(cla.connected){
            cla.sendMessageInner(data, receiver);
        } else {
            var authIntervall = setInterval(function(){
                if(cla.connected){
                    cla.sendMessageInner(data, receiver);
                    clearInterval(authIntervall);
                }
            }, 100)
        }
    }

    sendMessageInner(data: any, receiver: number = 0): void{
        console.log("Exchange message to: " + (receiver !== 0 ? receiver : 'all'));
        console.log(data);
        this.socket.emit('push', { room: this.room, sender: this.yourId, receiver: receiver, message: data});
    }
 
    addReadEvent(callback: (sender: number, dataroom: string, msg: any) => void): void{
        var cla = this;
        this.socket.on('pull', function(data) {
            if (data.room === cla.room && data.sender !== cla.yourId && (data.receiver == 0 || data.receiver == cla.yourId)) {
                callback(data.sender, data.dataroom, data.message);
            }
          });
    }

    closeConnection(): void{
        this.socket.close();
    }

}