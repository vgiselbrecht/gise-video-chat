import '../../sounds/messagealert.mp3';
import '../../sounds/reload.mp3';
import '../../sounds/newpartner.mp3';
import '../../sounds/hangout.mp3';
import { App } from '../app';
import { Settings } from "../Utils/Settings";
import config from "../../../config.json"

export class Sounds{

    static readonly messagealertsound: string = 'messagealert';
    static readonly reloadsound: string = 'reload';
    static readonly newpartnersound: string = 'newpartner';
    static readonly hangoutsound: string = 'hangout';

    static playSound(name: string, app: App, loop: boolean = false): HTMLAudioElement{
        if(this.allowedToPlaySound() && app.configuration.configurationVueObject.soundEffectsOn){
            var audi = new Audio('assets/'+name+'.mp3');
            // @ts-ignore
            if(typeof audi.sinkId !== 'undefined'){
                // @ts-ignore
                audi.setSinkId(app.devices.devicesVueObject.sound);
            }
            audi.loop = loop;
            audi.play();
            return audi;
        }
        return null;
    }

    static preloadSounds(){
        if(this.allowedToPlaySound()){
            this.preloadSound(this.messagealertsound);
            this.preloadSound(this.reloadsound);
            this.preloadSound(this.newpartnersound);
            this.preloadSound(this.hangoutsound);
        }
    }

    static allowedToPlaySound(): boolean{
        return Settings.getValueOrDefault(config, "features.soundEffects", false)
    }

    static preloadSound(name: string){
        var audio = new Audio('assets/'+name+'.mp3');
        audio.preload = 'auto';
    }


}