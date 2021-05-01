import { App } from "../app";

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
                src: null,
                closed: true,
                mode: null
            },
            methods: {
                closeLightbox () { 
                    var videoElement = document.querySelector("#lightboxVideoElement");
                    // @ts-ignore
                    videoElement.pause();
                    this.closed = true;
                    this.src = null;
                    this.mode = null
                }
            }
        })
    }

    addImage(src: string){
       this.lightboxVueObject.src = src;
       this.lightboxVueObject.mode = 'image';
       this.lightboxVueObject.closed = false;
    }

    addVideo(src: string){
        this.lightboxVueObject.src = src;
        this.lightboxVueObject.mode = 'video';
        this.lightboxVueObject.closed = false;
    }

    addYouTube(code: string){
        this.lightboxVueObject.src = 'https://www.youtube-nocookie.com/embed/' + code + '?autoplay=1&showinfo=0&modestbranding=1';
        this.lightboxVueObject.mode = 'youtube';
        this.lightboxVueObject.closed = false;
    }
}