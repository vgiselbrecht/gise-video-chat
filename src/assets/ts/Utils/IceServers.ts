import config from "../../../config.json"
import { Settings } from "./Settings";

export class IceServers{

    static iceServers = [];

    static loadIceServers(callback: () => void){
        var cla = this;
        var iceServersFromUrl = Settings.getValueOrDefault(config, 'communication.webrtc.iceServersFromUrl');
        if(iceServersFromUrl != null){
            $.getJSON(iceServersFromUrl, function(data) {
                cla.iceServers = data;
                cla.iceServers = cla.iceServers.concat(Settings.getValueOrDefault(config, 'communication.webrtc.iceServers', []));
                callback();
            });
        }else{
            this.iceServers = Settings.getValueOrDefault(config, 'communication.webrtc.iceServers', []);
            callback();
        }
    }


}