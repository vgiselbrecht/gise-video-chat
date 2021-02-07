import { App } from "../app";

export class Screen{

    app: App;
    screenOn: boolean = false;

    constructor(app: App){
        this.app = app;
    }

    startScreen(){
        this.initialScreen();
    }

    stopScreen(closed: boolean = false){
        this.screenOn = false;
        if(this.onScreenMode && !closed){
            this.app.localScreenStream.getTracks().forEach(track => track.stop());
        }
        this.app.controls.controlsVueObject.screenOn = false;
        // @ts-ignore
        this.app.yourVideo.srcObject = this.app.localStream;
        this.app.setStreamToPartners();
        this.app.yourVideoElement.videoVueObject.screenSharing = false;
        this.app.partnerListElement.partnerListElementVueObject.screenSharing = false;
        this.app.sendMessageToAllPartners(this.app.userinfo.getUserInfo());
    }

    initialScreen() {
        var cal = this;
        if(!this.app.localScreenStream || !this.app.localScreenStream.active){
            // @ts-ignore
            navigator.mediaDevices.getDisplayMedia()
            .then(function(stream){
                cal.screenOn = true;
                // @ts-ignore
                cal.app.yourVideo.srcObject = stream;
                cal.app.localScreenStream = stream;
                cal.app.controls.controlsVueObject.screenOn = true;
                cal.app.setStreamToPartners();
                cal.app.localScreenStream.getTracks()[0].onended = function () {
                    cal.stopScreen(true);
                };
                cal.app.yourVideoElement.videoVueObject.screenSharing = true;
                cal.app.partnerListElement.partnerListElementVueObject.screenSharing = true;
                cal.app.sendMessageToAllPartners(cal.app.userinfo.getUserInfo());
            });
        }else{
            // @ts-ignore
            this.app.yourVideo.srcObject = this.app.localScreenStream;
        }
    }

    onScreenMode(): boolean{
        if(this.app.localScreenStream && this.app.localScreenStream.active && this.screenOn){
            return true;
        }
        return false;
    }
}