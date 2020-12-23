import { Cookie } from "../Utils/Cookie.js";
export class Controls {
    constructor(app) {
        this.microphoneCookie = 'microphoneOn';
        this.cameraCookie = 'cameraOn';
        this.app = app;
        this.initialElements();
    }
    initialElements() {
        let cla = this;
        this.controlsVueObject = new Vue({
            el: '#controls',
            data: {
                microphoneOn: Cookie.getCookie(cla.microphoneCookie) == 'false' ? false : true,
                cameraOn: Cookie.getCookie(cla.cameraCookie) == 'false' ? false : true,
                hangouted: false,
                screenOn: false
            },
            methods: {
                toogleMicrophone: function () {
                    this.microphoneOn = !this.microphoneOn;
                    Cookie.setCookie(cla.microphoneCookie, this.microphoneOn);
                    cla.toogleStreamMicrophone();
                },
                toogleCamera: function () {
                    this.cameraOn = !this.cameraOn;
                    Cookie.setCookie(cla.cameraCookie, this.cameraOn);
                    cla.toogleStreamCamera();
                }, hangOut: function () {
                    if (!this.hangouted) {
                        cla.hangOut();
                        this.hangouted = true;
                    }
                    else {
                        location.reload();
                    }
                }, toogleScreen: function () {
                    if (cla.app.screen.onScreenMode()) {
                        cla.app.screen.stopScreen();
                    }
                    else {
                        cla.app.screen.startScreen();
                    }
                }
            }
        });
    }
    initialiseStream() {
        this.toogleStreamMicrophone();
        this.toogleStreamCamera();
    }
    toogleStreamMicrophone() {
        if (this.app.localStream != undefined) {
            this.app.localStream.getAudioTracks()[0].enabled = this.controlsVueObject.microphoneOn;
        }
    }
    toogleStreamCamera() {
        if (!this.app.localStream != undefined) {
            this.app.localStream.getVideoTracks()[0].enabled = this.controlsVueObject.cameraOn;
        }
    }
    hangOut() {
        this.app.hangOut();
    }
}
//# sourceMappingURL=Controls.js.map