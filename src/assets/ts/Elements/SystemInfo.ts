import { App } from "../app";
import { Settings } from "../Utils/Settings";
import npmpackage from "../../../../package.json"
import config from "../../../config.json"

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
                version: npmpackage.version,
                imprint: Settings.getValueOrDefault(config, "privacy.imprint"),
                gdpr: Settings.getValueOrDefault(config, "privacy.gdpr")

            },
            methods: {
            }
        });
    }
}