export class Video {
    constructor(element, partner) {
        this.element = element;
        this.partner = partner;
        this.addCodeToVideoElement();
        this.setVueElement();
    }
    addCodeToVideoElement() {
        $(this.element).find(".video-wrap").append(`
            <div class="video-info-wrap" v-on:dblclick="expand" v-bind:class="{'cammeraoff': cameraOff  && !screenSharing}">
                <div class="video-name">{{name}} 
                <span v-bind:class="{'on': !muted}" class="microphone fas fa-microphone-slash"></span> 
                <span v-bind:class="{'on': !cameraOff}" class="camera fas fa-video-slash"></span>
                <span v-bind:class="{'on': !screenSharing}" class="screen fas fa-desktop"></span>
                </div>
                <div v-on:click="expand" v-bind:class="{'fa-compress-arrows-alt': expanded, 'fa-expand-arrows-alt': !expanded}" class="expand fas"></div>
            </div>
        `);
    }
    setVueElement() {
        let cla = this;
        this.videoVueObject = new Vue({
            el: $(this.element).find(".video-info-wrap").get(0),
            data: {
                name: cla.partner ? cla.partner.getName() : "Du",
                expanded: false,
                muted: false,
                cameraOff: false,
                screenSharing: false
            },
            methods: {
                expand: function () {
                    $(cla.element).toggleClass("big");
                    this.expanded = !this.expanded;
                }
            }
        });
    }
}
//# sourceMappingURL=Video.js.map