import { Translator } from "../Utils/Translator";
import { App } from "../app";

declare var Vue: any;

export class Welcome{

    app: App;
    welcomeVueObject: any; 

    constructor(app: App){
        this.app = app;
        this.initialElements();
    }

    initialElements(){
        let cla = this;
        this.welcomeVueObject = new Vue({
            el: '#welcome',
            data: {
                open: false,
                showInvite: false,
                showSetName: false,
                link: location,
                copied: false,
                inviteotherwithlink: Translator.get("inviteotherwithlink"),
                name: "",
                namelabel: Translator.get("name"),
                yournamelabel: Translator.get("yourname")
            },
            methods: {
                copy: function(){
                    var copyText = document.getElementById("invite-link-welcome");
                    // @ts-ignore
                    copyText.select();
                    // @ts-ignore
                    copyText.setSelectionRange(0, 99999); 
                    document.execCommand("copy");
                    copyText.blur();
                    window.getSelection().removeAllRanges();
                    this.copied = true;
                    var vucla = this;
                    setTimeout(function(){
                        vucla.copied = false;
                    }, 5000)
                },
                changeUserinfo: function(){
                    cla.app.userinfo.setUserInfo(this.name);
                },
                close: function(){
                    cla.closeDialog();
                }
            }
        });
    }

    openDialog(newRoom: boolean, noName: boolean){
        var cla = this;
        this.welcomeVueObject.showInvite = newRoom;
        this.welcomeVueObject.showSetName = noName;
        if(newRoom || noName){
            setTimeout(function(){
                cla.welcomeVueObject.open = true;
                $("#welcome .setname input").focus();
            },100)
        }
    }

    closeDialog(){
        this.welcomeVueObject.open = false;
    }
}