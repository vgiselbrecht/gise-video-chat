import { Translator } from "../Utils/Translator";

export class Alert{

    id: number;
    
    constructor(message: string){
        this.id = Math.floor(Math.random()*1000000000);
        this.addAlertBox(message);
    }

    addAlertBox(message){
        var cla = this;
        const msgHTML = `
            <div id="alert-${this.id}" class="alert-message">
                <div class="alert-inner">
                    <div class="message">${message}</div>
                    <div class="button-area">
                        <button class="button">${Translator.get("ok")}</button>
                    </div>
                </div>
            </div>
        `;
        $("body").append(msgHTML);
        $("#alert-"+this.id+ " button").on("click", function(){
            $("#alert-"+cla.id).remove();
        });
    }

}