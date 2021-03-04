import '../../sounds/messagealert.mp3';
import '../../sounds/reload.mp3';
import { App } from '../app';

export class Sounds{

    static readonly messagealertsound: string = 'messagealert';
    static readonly reloadsound: string = 'reload';

    static playSound(name: string, app: App, loop: boolean = false): HTMLAudioElement{
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

    static preloadSounds(){
        this.preloadSound(this.messagealertsound);
        this.preloadSound(this.reloadsound);
    }

    static preloadSound(name: string){
        var audio = new Audio('assets/'+name+'.mp3');
        audio.preload = 'auto';
    }


}