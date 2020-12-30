export class Video {
    constructor(element, partner) {
        this.element = element;
        this.partner = partner;
        this.addCodeToVideoElement();
        this.setVueElement();
    }
    addCodeToVideoElement() {
        $(this.element).find(".video-wrap").append(`
            <div class="video-info-wrap" v-on:dblclick="expand">
                <div class="video-name">{{name}}</div>
                <div v-on:click="expand" class="expand fas fa-expand-arrows-alt"></div>
            </div>
        `);
    }
    setVueElement() {
        let cla = this;
        this.videoVueObject = new Vue({
            el: $(this.element).find(".video-info-wrap").get(0),
            data: {
                name: cla.partner ? cla.partner.getName() : "Du",
            },
            methods: {
                expand: function () {
                    $(cla.element).toggleClass("big");
                }
            }
        });
    }
}
//# sourceMappingURL=Video.js.map