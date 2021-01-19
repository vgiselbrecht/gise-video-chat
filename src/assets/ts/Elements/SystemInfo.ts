import { App } from "../app";
import npmpackage from "../../../../package.json"

declare var Vue: any;

export class SystemInfo{

    app: App;
    systemInfoVueObject: any; 


    constructor(app: App){
        this.app = app;
        this.initialElements();
    }

    initialElements(){
        let cla = this;
        this.systemInfoVueObject = new Vue({
            el: '#systeminfo',
            data: {
                version: npmpackage.version
            },
            methods: {
            }
        });
    }
}