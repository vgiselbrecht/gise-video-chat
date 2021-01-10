import { App } from "../app";

declare var Vue: any;

export class Invite{

    app: App;
    inviteVueObject: any; 

    constructor(app: App){
        this.app = app;
        this.initialElements();
    }

    initialElements(){
        let cla = this;
        this.inviteVueObject = new Vue({
            el: '#invite',
            data: {
                link: location,
                copied: false
            },
            methods: {
                copy: function(){
                    var copyText = document.getElementById("invite-link");
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
                }
            }
        });
    }
}