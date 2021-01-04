import { App } from "../app";
import { Cookie } from "../Utils/Cookie";

declare var Vue: any;

export class Userinfo{

    static readonly userinfoMessageType: string = 'userinfo';
    
    readonly nameCookie: string = 'name';
    
    app: App;
    userinfoVueObject: any; 


    constructor(app: App){
        this.app = app;
        this.app.yourName = Cookie.getCookie(this.nameCookie) ?? null;
        this.initialElements();
    }

    initialElements(){
        let cla = this;
        this.userinfoVueObject = new Vue({
            el: '#userinfo',
            data: {
                name: Cookie.getCookie(cla.nameCookie) ?? ""
            },
            methods: {
                changeUserinfo: function(){
                    cla.app.sendMessageToAllPartners(cla.getUserInfo()); 
                    Cookie.setCookie(cla.nameCookie, this.name);
                    cla.app.yourName = this.name;
                }
            }
        });
    }

    getUserInfo(){
        return {
            type: Userinfo.userinfoMessageType, message: 
                {
                    name: this.userinfoVueObject.name, 
                    muted: !this.app.controls.controlsVueObject.microphoneOn,
                    cameraOff: !this.app.controls.controlsVueObject.cameraOn,
                    screenSharing: this.app.screen.onScreenMode(),
                    listener: this.app.listener
                }
            };
    }
}