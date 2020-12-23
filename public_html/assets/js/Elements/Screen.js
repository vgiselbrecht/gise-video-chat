export class Screen {
    constructor(app) {
        this.screenOn = false;
        this.app = app;
    }
    startScreen() {
        this.initialScreen();
    }
    stopScreen(closed = false) {
        this.screenOn = false;
        if (this.onScreenMode && !closed) {
            this.app.localScreenStream.getTracks().forEach(track => track.stop());
        }
        this.app.controls.controlsVueObject.screenOn = false;
        // @ts-ignore
        this.app.yourVideo.srcObject = this.app.localStream;
        this.app.setStreamToPartners();
    }
    initialScreen() {
        var cal = this;
        if (!this.app.localScreenStream || !this.app.localScreenStream.active) {
            // @ts-ignore
            navigator.mediaDevices.getDisplayMedia()
                .then(function (stream) {
                cal.screenOn = true;
                // @ts-ignore
                cal.app.yourVideo.srcObject = stream;
                cal.app.localScreenStream = stream;
                cal.app.controls.controlsVueObject.screenOn = true;
                cal.app.setStreamToPartners();
                cal.app.localScreenStream.getTracks()[0].onended = function () {
                    cal.stopScreen(true);
                };
            });
        }
        else {
            // @ts-ignore
            this.app.yourVideo.srcObject = this.app.localScreenStream;
        }
    }
    onScreenMode() {
        if (this.app.localScreenStream && this.app.localScreenStream.active && this.screenOn) {
            return true;
        }
        return false;
    }
}
//# sourceMappingURL=Screen.js.map