import { App } from "../app";
import { Cookie } from "../Utils/Cookie";
import { Translator } from "../Utils/Translator";

declare var Vue: any;

export class Configuration{

    app: App;
    configurationVueObject: any; 

    readonly soundEffectsCookie: string = 'soundEffectsOn';

    constructor(app: App){
        this.app = app;
        this.initialElements();
    }

    initialElements(){
        let cla = this;
        this.configurationVueObject = new Vue({
            el: '#configuration',
            data: {
                soundEffectsOn: Cookie.getCookie(cla.soundEffectsCookie) == 'false' ? false : true,
                soundeffects: Translator.get("soundeffects")
            },
            methods: {
                toogleSoundEffects: function () {
                    Cookie.setCookie(cla.soundEffectsCookie, this.soundEffectsOn);
                }
            }
        });

    } 
}