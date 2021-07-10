import { App } from "../app";
import { IPartner } from "../Partner/IPartner";
import { IPartners } from "../Partner/IPartners";
import { Translator } from "../Utils/Translator";

declare var Vue: any;

export class PartnerListElement{

    app: App;
    partner: IPartner;
    partnerListElementVueObject: any; 

    constructor(partner: IPartner){
        this.partner = partner;
        this.addCodeToVideoElement();
        this.setVueElement();
    }

    addCodeToVideoElement(){
        $("#partnerlist ul").append(`
            <li id="partnerlistelement-${this.partner ? this.partner.id : 0}" v-bind:class="{'unconnected': !connected}">
                {{ name }} 
                <span v-bind:class="{'on': !listener}" class="listener fas fa-eye"></span>
                <span v-bind:class="{'on': !soundOff}" class="sound fas fa-volume-mute"></span> 
                <span v-bind:class="{'on': !muted || listener}" class="microphone fas fa-microphone-slash"></span> 
                <span v-bind:class="{'on': !cameraOff || listener}" class="camera fas fa-video-slash"></span>
                <span v-bind:class="{'on': !screenSharing}" class="screen fas fa-desktop"></span>
            </li>
        `);
    }

    setVueElement(){
        let cla = this;
        this.partnerListElementVueObject = new Vue({
            el: "#partnerlistelement-" + (cla.partner ? cla.partner.id : 0),
            data: {
                name: cla.partner ? cla.partner.getName() : Translator.get("You"),
                muted: false,
                connected: true,
                cameraOff: false,
                screenSharing: false,
                listener: false,
                soundOff: false
            },
            methods: { 
            }
        });
    }

}