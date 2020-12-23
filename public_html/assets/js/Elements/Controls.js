export class Controls {
    constructor(app) {
        this.app = app;
        this.initialElements();
        this.toogleStreamMicrophone();
        this.toogleStreamCamera();
    }
    initialElements() {
        let cla = this;
        this.controlsVueObject = new Vue({
            el: '#controls',
            data: {
                microphoneOn: true,
                cameraOn: true,
                hangouted: false
            },
            methods: {
                toogleMicrophone: function () {
                    this.microphoneOn = !this.microphoneOn;
                    cla.toogleStreamMicrophone();
                },
                toogleCamera: function () {
                    this.cameraOn = !this.cameraOn;
                    cla.toogleStreamCamera();
                }, hangOut: function () {
                    if (!this.hangouted) {
                        cla.hangOut();
                        this.hangouted = true;
                    }
                    else {
                        location.reload();
                    }
                }
            }
        });
    }
    toogleStreamMicrophone() {
        if (this.app.localStream != undefined) {
            this.app.localStream.getAudioTracks()[0].enabled = this.controlsVueObject.microphoneOn;
        }
    }
    toogleStreamCamera() {
        if (this.app.localStream != undefined) {
            this.app.localStream.getVideoTracks()[0].enabled = this.controlsVueObject.cameraOn;
        }
    }
    hangOut() {
        this.app.hangOut();
    }
}
//# sourceMappingURL=Controls.js.map