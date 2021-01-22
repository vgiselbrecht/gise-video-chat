import * as ts from "typescript";

export class Settings{

    static getValueOrDefault(config: object, key: string, defaultValue: any = null){
        if(Settings.checkPath(config, key)){
            var value = Settings.getValue(config, key);
            if(value !== ""){
                return value;
            }
        }
        return defaultValue;
    }

    static getValue(o, path){
        if(path.includes('.')){
          return Settings.getValue(o[path.split('.')[0]], path.split('.').slice(1).join('.'));
        }else return o[path];
    }

    private static checkPath(o, path){
        if(path.includes('.')){
          if(o.hasOwnProperty(path.split('.')[0])) return Settings.checkPath(o[path.split('.')[0]], path.split('.').slice(1).join('.'));
          else return false
        }else return o.hasOwnProperty(path);
    }

}