import { App } from "../app";
import { Cookie } from "../Utils/Cookie";
import { Translator } from "../Utils/Translator";

declare var Vue: any;

export class Devices{

    readonly audioCookie: string = 'audio';
    readonly videoCookie: string = 'video';
    readonly soundCookie: string = 'sound';

    app: App;

    audioDevices: IDeviceList = {};
    videoDevices: IDeviceList = {};
    soundDevices: IDeviceList = {};

    devicesVueObject: any; 

    constructor(app: App){
        this.app = app;
        this.setDeviceElements();
        var cla = this;
        navigator.mediaDevices.ondevicechange = function(event) {
            cla.gotDevices();
        }
    }

    gotDevices(init: boolean = false) {
        var cla = this;
        navigator.mediaDevices.enumerateDevices().then(function(deviceInfos){
            var haveCamera = false;
            cla.audioDevices = {};
            cla.videoDevices = {};
            cla.soundDevices = {};
            for (let i = 0; i !== deviceInfos.length; ++i) {
                const deviceInfo = deviceInfos[i];
                var value = deviceInfo.deviceId;
                if (deviceInfo.kind === 'audioinput') {
                    var text = deviceInfo.label || Translator.get("microphone");
                    cla.audioDevices[value] = text;
                } else if (deviceInfo.kind === 'audiooutput') {
                    var text = deviceInfo.label || Translator.get("speaker");
                    cla.soundDevices[value] = text;
                } else if (deviceInfo.kind === 'videoinput') {
                    var text = deviceInfo.label || Translator.get("video");
                    cla.videoDevices[value] = text;
                    haveCamera = true;
                } else {
                    console.log('Some other kind of source/device: ', deviceInfo);
                }
            }
            cla.app.microphoneOnlyNotChangeable = cla.app.microphoneOnly = !haveCamera;
            cla.setDeviceElements();
            cla.app.initialCamera(init);
            cla.attachSinkId();
        });
    }

    setDeviceElements(){
        var cla = this;
        if(!this.devicesVueObject){
            this.devicesVueObject = new Vue({
                el: '#devices',
                data: {
                    audio: null,
                    audiooptions: {},
                    video: null,
                    videooptions: {},
                    sound: null,
                    soundoptions: {},
                    // @ts-ignore
                    soundAllowed: typeof cla.app.yourVideo.sinkId !== 'undefined',
                    microphonelabel: Translator.get("microphone"),
                    videolabel: Translator.get("video"),
                    speakerlabel: Translator.get("speaker"),
                },
                methods: {
                    onChange() {
                        Cookie.setCookie(cla.audioCookie, this.audio);
                        Cookie.setCookie(cla.videoCookie, this.video);
                        Cookie.setCookie(cla.soundCookie, this.sound);
                        cla.app.initialCamera();
                        cla.attachSinkId();
                    }
                }
            })
        }
        this.devicesVueObject.audio = this.getDefaultDevice(cla.audioDevices, this.audioCookie);
        this.devicesVueObject.audiooptions = cla.audioDevices;
        this.devicesVueObject.video = this.getDefaultDevice(cla.videoDevices, this.videoCookie);
        this.devicesVueObject.videooptions = cla.videoDevices;
        this.devicesVueObject.sound = this.getDefaultDevice(cla.soundDevices, this.soundCookie);
        this.devicesVueObject.soundoptions = cla.soundDevices;
    }

    getDefaultDevice(list: any, cookieKey: string){
        var value = Cookie.getCookie(cookieKey);
        if(value in list){
            return value;
        }
        if(Object.keys(list).length !== 0){
            return Object.keys(list)[0];
        }
        return null;
    }

    attachSinkId() {
        // @ts-ignore
        if (typeof this.app.yourVideo.sinkId !== 'undefined') {
            for (var id in this.app.partners) {
                this.app.partners[id].setSinkId(this.devicesVueObject.sound);
            }
        } else {
          console.warn('Browser does not support output device selection.');
        }
    }
}

export interface IDeviceList{
    [key: number]: string;
}