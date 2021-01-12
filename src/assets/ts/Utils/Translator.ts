import { default as langde } from "../../translations/lang.de";
import { default as langen } from "../../translations/lang.en";

export class Translator{
    
    static get(key: string): string{
        var lang = this.getTranslationData();
        if(key in lang){
            return lang[key];
        }
        return key;
    }

    static getTranslationData(){
        if(navigator.language.substr(0,2) === "de"){
            return langde;
        } 
        return langen;
    }

    static setTranslationsInHTML(){
        $('[data-lang]').each(function(){
            $(this).html(Translator.get($(this).data("lang")))
        });
    }

}