import { App } from "../app.js";
import { IPartner } from "../Partner/IPartner.js";

declare var Vue: any;

export class Textchat{

    readonly textchatMessageType: string = 'textchat';
    
    app: App;
    textchatVueObject: any; 


    constructor(app: App){
        this.app = app;
        this.initialElements();
    }

    initialElements(){ 
        let cla = this;
        this.textchatVueObject = new Vue({
            el: '#textchat',
            data: {
                message: "",
                result: "",
            },
            methods: {
                sendMessage: function(){
                    cla.app.sendMessageToAllPartners({type: cla.textchatMessageType, message: {text: this.message}}); 
                    cla.addTextToChat("You", this.message);
                    this.message = "";
                }
            }
        });
    }

    addNewMessageToChat(message: any, partner: IPartner){
        if(message.text !== undefined){
            this.addTextToChat(partner.getName(), message.text);
        }

    }

    addTextToChat(sender: string, message: string){
        this.textchatVueObject.result += sender + ": " + message + "<br>";
    }

}
