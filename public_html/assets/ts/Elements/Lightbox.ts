import { App } from "../app.js";

declare var Vue: any;

export class Lightbox{


    app: App;
    lightboxVueObject: any; 

    constructor(app: App){
        this.app = app;
        this.setLightboxElements();
    }

    setLightboxElements(){
        var cla = this;
        this.lightboxVueObject = new Vue({
            el: '#lightbox',
            data: {
                image: null,
                closed: true
            },
            methods: {
                closeLightbox () {
                    this.closed = true
                }
            }
        })
    }

    addImage(src: string){
       this.lightboxVueObject.image = src;
       this.lightboxVueObject.closed = false;
    }
}