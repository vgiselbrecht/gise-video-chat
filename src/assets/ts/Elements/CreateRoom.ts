import { App } from "../app";
import { Translator } from "../Utils/Translator";

declare var Vue: any;

export class CreateRoom{

    app: App;
    createRoomVueObject: any; 


    constructor(app: App){
        this.app = app;
        this.initialElements();
    }

    initialElements(){
        let cla = this;
        this.createRoomVueObject = new Vue({
            el: '#create-room',
            data: {
                showDialog: false,
                roomNameLabel: Translator.get("roomname"),
                roomName: ""
            },
            methods: {
                createRoom: function(){
                    if(this.roomName !== ""){
                        cla.app.room = this.roomName;
                        location.hash = this.roomName;
                        cla.app.openConnection();
                        cla.app.invite.resetLink();
                        this.showDialog = false;
                    }
                }
            }
        });
    }

    showCreateRoom(show: boolean = true){
        this.createRoomVueObject.showDialog = show;
    }
}