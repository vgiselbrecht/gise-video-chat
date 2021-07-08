import { App } from "../app";
import { Cookie } from "../Utils/Cookie";
import { Translator } from "../Utils/Translator";
import { Alert } from "./Alert";

declare var Vue: any;

export class Controls{

    app: App;
    controlsVueObject: any; 

    readonly microphoneCookie: string = 'microphoneOn';
    readonly cameraCookie: string = 'cameraOn';
    readonly muteType: string = 'mute';

    constructor(app: App){
        this.app = app;
        this.initialElements();
        this.setSidebarClickRemove();
    }

    initialElements(){
        let cla = this;
        this.controlsVueObject = new Vue({
            el: '#controls',
            data: {
                microphoneOn: Cookie.getCookie(cla.microphoneCookie) == 'false' ? false : true,
                cameraOn: Cookie.getCookie(cla.cameraCookie) == 'false' ? false : true,
                hangouted: false,
                screenOn: false,
                optionOn: false,
                screenSharingNotAllowed: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
                hasNewMessage: false
            },
            methods: {
                toogleMicrophone: function () {
                    if(cla.app.localStream !== undefined){
                    this.microphoneOn = !this.microphoneOn;
                    Cookie.setCookie(cla.microphoneCookie, this.microphoneOn);
                    cla.toogleStreamMicrophone(false);
                    cla.app.sendMessageToAllPartners(cla.app.userinfo.getUserInfo());
                    } else {
                        new Alert(Translator.get("cannotstartmicrophone"));
                    }
                },
                toogleCamera: function () {
                    if(!cla.app.microphoneOnlyNotChangeable && cla.app.localStream !== undefined){
                        this.cameraOn = !this.cameraOn;
                        cla.app.microphoneOnly = !this.cameraOn;
                        Cookie.setCookie(cla.cameraCookie, this.cameraOn);
                        cla.toogleStreamCamera();
                        cla.app.sendMessageToAllPartners(cla.app.userinfo.getUserInfo());
                    } else {
                        new Alert(Translator.get("cannotstartcamera"));
                    }
                },hangOut: function () {
                    if(!this.hangouted){
                        cla.hangOut();
                        this.hangouted = true;
                    } else{
                        location.hash = cla.app.room;
                        location.reload();
                    }                    
                }, toogleScreen: function(){
                    if(cla.app.screen.onScreenMode()){
                        cla.app.screen.stopScreen();
                    }else{
                        cla.app.screen.startScreen();
                    }
                }, toogleOption: function(){
                    this.optionOn = !this.optionOn;
                    cla.toogleOption(); 
                }
            }
        });

        this.setMutedIcon();
        this.setCameraOffIcon();


        //tabs
        $('#sidebar .tabs .tabs-header > *:first').addClass('active');
        $('#sidebar .tabs .tabs-content > *:first').addClass('active');
            
        $('#sidebar .tabs .tabs-header > *').on('click', function(){
            var t = $(this).attr('tab');
            cla.activateSidebarTab(t);
        });

    }

    activateSidebarTab(type: string){
        $('#sidebar .tabs .tabs-header > *').removeClass('active');           
        $('#sidebar .tabs .tabs-header > [tab=' + type + '] ').addClass('active');

        $('#sidebar .tabs .tabs-content > *').removeClass('active');  
        $('#sidebar .tabs .tabs-content > #tab-'+ type ).addClass('active');
    }

    initialiseStream(){
        this.toogleStreamMicrophone(false);
        this.toogleStreamCamera(false); 
    }

    toogleStreamMicrophone(changeCamera: boolean = true)
    {
        if(this.app.localStream == undefined){
            this.controlsVueObject.microphoneOn = false;  
        }else {
            this.app.localStream.getAudioTracks()[0].enabled = this.controlsVueObject.microphoneOn;
            if(changeCamera && this.controlsVueObject.microphoneOn){
                this.app.initialCamera();  
            }
        }
        this.setMutedIcon();
    }

    toogleStreamCamera(changeCamera: boolean = true)
    {
        if(this.app.microphoneOnlyNotChangeable || this.app.localStream == undefined){
            this.controlsVueObject.cameraOn = false;  
        } else {
            if(this.app.localStream.getVideoTracks()[0] != undefined){
                this.app.localStream.getVideoTracks()[0].enabled = this.controlsVueObject.cameraOn;
            }
            if(changeCamera){
                this.app.initialCamera();
            }
        }
        this.setCameraOffIcon();
    }

    setMutedIcon(){
        this.app.yourVideoElement.videoVueObject.muted = !this.controlsVueObject.microphoneOn;
        this.app.partnerListElement.partnerListElementVueObject.muted = !this.controlsVueObject.microphoneOn;
    }

    setCameraOffIcon(){
        this.app.yourVideoElement.videoVueObject.cameraOff = !this.controlsVueObject.cameraOn;
        this.app.partnerListElement.partnerListElementVueObject.cameraOff = !this.controlsVueObject.cameraOn;
    }

    toogleOption(){
        this.app.sidebarToogle(this.controlsVueObject.optionOn);
    }

    setSidebarClickRemove(){
        var cla = this;
        $("#clickbackground").on("click", function(){
            if(cla.controlsVueObject.optionOn){
                cla.controlsVueObject.toogleOption();
            }
        });
    }

    hangOut(){
        this.app.hangOut();
    }

    setToMuted(){
        if(this.controlsVueObject.microphoneOn){
            this.controlsVueObject.toogleMicrophone();
        }
    }

    setNewMessage(hasNewMessage){
        this.controlsVueObject.hasNewMessage = hasNewMessage; 
        if(hasNewMessage){
            $('#sidebar .tabs .tabs-header > [tab=chat] ').addClass('notification');
        }else{
            $('#sidebar .tabs .tabs-header > [tab=chat] ').removeClass('notification');
        }
    }

}