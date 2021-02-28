import '../../sounds/messagealert.mp3';

export class Sounds{

    static readonly messagealertsound: string = 'messagealert';

    static playSound(name: string){
        new Audio('assets/'+name+'.mp3').play();
    }

}