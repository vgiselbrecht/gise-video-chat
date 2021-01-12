import { Alert } from "../Elements/Alert";
import { Translator } from "../Utils/Translator";
import { IDatabase } from "./IDatabase";
import { IDatabaseStructure } from "./IDatabase";
import { IDatabaseObject } from "./IDatabase";
import { IDatabaseObjectElement } from "./IDatabase";
import { IDatabaseObjectElementList } from "./IDatabase";
import { IDatabaseQuery } from "./IDatabase";

export class IndexedDB implements IDatabase{

    db: any;
    request: any;

    constructor(){
        if (!window.indexedDB) {
            new Alert(Translator.get("errortosavechat"));
        }
    }

    initDatabase(database: string, version: number = 1, structur: IDatabaseStructure, callback: (success: boolean, caller: any) => void, caller: any){
        var cla = this;

        this.request = window.indexedDB.open(database, version);
         
        this.request.onerror = function(event) {
            console.log("Error to connect to DB!");
        };
         
        this.request.onupgradeneeded = function(event) {
            cla.db = event.target.result;
            for(var objectname in structur){
                cla.createObject(structur[objectname]);
            } 
        }

        this.request.onsuccess = function(event) {
            cla.db = cla.request.result;
            callback(true, caller);
        };
    }

    add(object: IDatabaseObject, data: any, callback: (success: boolean, caller: any) => void, caller: any){
        var request = this.db.transaction([object.name], "readwrite")
        .objectStore(object.name)
        .add(data);
        
        request.onsuccess = function(event) {
           callback(true, caller);
        };
        
        request.onerror = function(event) {
            callback(false, caller);
        }
    }

    read(object: IDatabaseObject, query: IDatabaseQuery, callback: (success: boolean, data: any, caller: any) => void, caller: any){
        var store = this.db.transaction(object.name, 'readonly').objectStore(object.name);
        if(query){
            var cursorQuery = store.index(query.element.name).getAll(query.value);
        } else{
            var cursorQuery = store.getAll();
        }
        cursorQuery.onerror = ev => {
            callback(false, null, caller);
        };
        cursorQuery.onsuccess = ev => {
            callback(true, cursorQuery.result, caller);
        };
    }

    createObject(object: IDatabaseObject){
        var objectStore = this.db.createObjectStore(object.name, {keyPath: object.keyPath, autoIncrement: true});
        for (var elementName in object.elements) {
            this.createElement(object.elements[elementName], objectStore);
        }
    }

    createElement(element: IDatabaseObjectElement, objectStore: any){
        objectStore.createIndex(element.name, element.name, { unique: element.unique });
    }

}