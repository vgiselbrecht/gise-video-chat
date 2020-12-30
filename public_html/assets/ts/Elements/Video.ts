import { IPartner } from "../Partner/IPartner.js";

declare var Vue: any;

export class Video{

    element: HTMLElement;
    partner: IPartner;

    videoVueObject: any;

    constructor(element: HTMLElement, partner: IPartner){
        this.element = element;
        this.partner = partner;
        this.addCodeToVideoElement();
        this.setVueElement();
    }

    addCodeToVideoElement(){
        $(this.element).find(".video-wrap").append(`
            <div class="video-info-wrap" v-on:dblclick="expand">
                <div class="video-name">{{name}}</div>
                <div v-on:click="expand" v-bind:class="{'fa-compress-arrows-alt': expanded, 'fa-expand-arrows-alt': !expanded}" class="expand fas"></div>
            </div>
        `);
    }

    setVueElement(){
        let cla = this;
        this.videoVueObject = new Vue({
            el: $(this.element).find(".video-info-wrap").get(0),
            data: {
                name: cla.partner ? cla.partner.getName() : "Du",
                expanded: false
            },
            methods: {
                expand: function(){
                    $(cla.element).toggleClass("big");
                    this.expanded = !this.expanded;
                }
            }
        });
    }

}