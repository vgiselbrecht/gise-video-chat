export class Lightbox {
    constructor(app) {
        this.app = app;
        this.setLightboxElements();
    }
    setLightboxElements() {
        var cla = this;
        this.lightboxVueObject = new Vue({
            el: '#lightbox',
            data: {
                image: null,
                closed: true
            },
            methods: {
                closeLightbox() {
                    this.closed = true;
                }
            }
        });
    }
    addImage(src) {
        this.lightboxVueObject.image = src;
        this.lightboxVueObject.closed = false;
    }
}
//# sourceMappingURL=Lightbox.js.map