import { Translator } from "../Utils/Translator";
import { App } from "../app";

export class NoInternet{

    app: App;

    noInternet: boolean = false;

    constructor(app: App){
        this.app = app;
    }

    setNoInternet(noInternet: boolean){
        if(noInternet != this.noInternet){
            if(noInternet){
                this.addNoInternetBox();
            }else{
                this.removeNoInternetBox();
                this.app.exchange.sendMessage({'call': 'recall'});
            }
        }
        this.noInternet = noInternet;
    }

    addNoInternetBox(){
        var cla = this;
        const msgHTML = `
            <div id="nointernet" class="nointernet-message">
                <div class="nointernet-inner">
                    <span class="fas fa-sync"></span>
                    <div class="message">${Translator.get("nointernet")}</div>
                </div>
            </div>
        `;
        $("#video-area").append(msgHTML);
    }

    removeNoInternetBox(){
        $("#nointernet").remove();
    }

}