import { App } from "../app";
import { IPartner } from "../Partner/IPartner";
import { IDatabase } from "../Database/IDatabase";
import { IDatabaseStructure } from "../Database/IDatabase";
import { IDatabaseObject } from "../Database/IDatabase";
import { IDatabaseObjectElement } from "../Database/IDatabase";
import { IDatabaseObjectElementList } from "../Database/IDatabase";
import { IDatabaseQuery } from "../Database/IDatabase";
import { IndexedDB } from "../Database/IndexedDB";

declare var Vue: any;

export class Textchat{

    readonly dbVersion: number = 1;

    readonly textchatMessageType: string = 'textchat';
    readonly textchatDatabaseName: string = 'chat';
    readonly textchatDatabaseObjectName: string = 'textchat';
    
    readonly textchatMessageTypeText: string = 'text';
    readonly textchatMessageTypeImage: string = 'image';

    readonly textchatMaxImageSize: number = 800;
    
    app: App;
    textchatVueObject: any; 
    database: IDatabase;
    databaseStructure: IDatabaseStructure;

    hasNewMessage: boolean = false;

    constructor(app: App){
        this.app = app;
        this.initialElements();
        this.initialDatabase();
        var cla = this;
        setInterval(function(){
            if(cla.isChatVisible()){
                if(cla.hasNewMessage){
                    cla.setHasNewMessage(false);
                    cla.scrollToBottom();
                }
            }
        }, 100);
    }

    initialElements(){ 
        let cla = this;
        this.textchatVueObject = new Vue({
            el: '#textchat',
            data: {
                message: "",
                result: "",
                extrainfo: "",
                extrainfoVisible: false,
                image: null
            },
            methods: {
                sendMessage: function(){
                    if(this.image){
                        var message = {
                            image: {
                                image: this.image,
                                text: this.message
                            }
                        }
                        var data = {type: cla.textchatMessageType, message: message};
                        if(cla.checkSize(data)){
                            cla.app.sendMessageToAllPartners(data); 
                            cla.addMessage("Du", message.image, new Date(), true, cla.textchatMessageTypeImage);
                        } else {
                            alert("Datei ist zu groß für den Versand, die Datei darf nur 256kb groß sein!");
                            return;
                        }
                    } else if(this.message){
                        cla.app.sendMessageToAllPartners({type: cla.textchatMessageType, message: {text: this.message}}); 
                        cla.addMessage("Du", this.message, new Date(), true);
                    }
                    this.image = null;
                    this.extrainfoVisible = false;
                    this.message = "";
                },
                addfile: function(e){
                    var vue = this;
                    var fileList = e.target.files;
                    if (!fileList.length) return;
                    let reader = new FileReader();
                    if(fileList[0] && fileList[0].type.match(/image.*/)) {
                        reader.onload = (readerEvent) => {
                            /*vue.image = reader.result.toString();
                            cla.setImageToExtra(vue.image);*/
                            var image = new Image();
                            image.onload = function (imageEvent) {
                                var canvas = document.createElement('canvas'),
                                    max_size = cla.textchatMaxImageSize,
                                    width = image.width,
                                    height = image.height;
                                if (width > height) {
                                    if (width > max_size) {
                                        height *= max_size / width;
                                        width = max_size;
                                    }
                                } else {
                                    if (height > max_size) {
                                        width *= max_size / height;
                                        height = max_size;
                                    }
                                }
                                canvas.width = width;
                                canvas.height = height;
                                canvas.getContext('2d').drawImage(image, 0, 0, width, height);
                                var dataUrl = canvas.toDataURL('image/jpeg');
                                cla.setImageToExtra(dataUrl);
                                vue.image = dataUrl;
                            }
                            image.src = readerEvent.target.result.toString();
                        }
                        reader.readAsDataURL(fileList[0]);
                    }
                    e.target.value = "";
                },
                closeExtra: function(){
                    this.image = null;
                    this.extrainfoVisible = false;
                }
            }
        });
    }

    initialDatabase(){
        this.database = new IndexedDB();
        this.databaseStructure = {
            [this.textchatDatabaseObjectName]: {
                name: this.textchatDatabaseObjectName,
                keyPath: 'id',
                autoIncrement: true,
                elements: {
                    room: {
                        name: 'room',
                        unique: false
                    },
                    partnerName: {
                        name: 'partnerName',
                        unique: false
                    },
                    date: {
                        name: 'date',
                        unique: false
                    },
                    self: {
                        name: 'self',
                        unique: false
                    },
                    message: {
                        name: 'message',
                        unique: false
                    },
                    type: {
                        name: 'type',
                        unique: false
                    }
                }
            }
        };
        this.database.initDatabase(this.textchatDatabaseName, this.dbVersion, this.databaseStructure, function(success: boolean, caller: Textchat){
            if(success){
                caller.loadMessagesFromDB();
            } else {
                console.log("Cannot create DB!");
            }
        }, this);
    }

    loadMessagesFromDB(){
        var query: IDatabaseQuery = {
            element: {
                name: 'room',
                unique: false
            },
            value: this.app.room
        };
        this.database.read(this.databaseStructure[this.textchatDatabaseObjectName], query, function(success: boolean, data: any, caller: Textchat){
            if(success){
                for(var i = 0; i < data.length; i++){
                    caller.addMessageToChat(data[i].partnerName, data[i].message, data[i].date, data[i].self, data[i].type);
                }
            }else{
                console.log("Cannot read message to DB!"); 
            }
        }, this);
    }

    addNewPartnerMessageToChat(message: any, partner: IPartner){
        if(message.text !== undefined){
            this.addMessage(partner.getName(), message.text);
        } else if(message.image !== undefined){
            this.addMessage(partner.getName(), message.image, new Date(), false, this.textchatMessageTypeImage);
        }
        this.gotNewMessage();
    }


    addMessage(sender: string, message: any, datetime: Date = new Date(), self: boolean = false, type: string = this.textchatMessageTypeText){
        this.addMessageToChat(sender, message, datetime, self, type);
        var data = {
            room: this.app.room,
            partnerName: sender,
            date: datetime,
            self: self,
            message: message,
            type: type
        };
        this.database.add(this.databaseStructure[this.textchatDatabaseObjectName], data, function(success: boolean, caller: Textchat){
            if(!success){
                console.log("Cannot add message to DB!");
            }
        }, this);
    }

    addMessageToChat(sender: string, message: any, datetime: Date = new Date(), self: boolean = false, type: string = this.textchatMessageTypeText){
        if(type === this.textchatMessageTypeText){
            if(this.checkMessageIsImage(message)){
                this.addImageToChat(sender, {image: message.trim(), text: ""}, datetime, self); 
            } else if(this.checkMessageIsVideo(message)) {
                this.addVideoToChat(sender, {video: message.trim(), text: ""}, datetime, self);
            } else {
                this.addTextToChat(sender, message, datetime, self);
            }
        } else if(type === this.textchatMessageTypeImage){
            this.addImageToChat(sender, message, datetime, self);
        }
    }

    addTextToChat(sender: string, message: string, datetime: Date = new Date(), self: boolean = false){
        var side = self ? "right" : "left";
        const msgHTML = `
            <div class="msg ${side}-msg">
            <div class="msg-bubble">
                <div class="msg-info">
                    <div class="msg-info-name">${sender}</div>
                    <div class="msg-info-time">${this.formatDate(datetime)}</div>
                </div>

                <div class="msg-text">${this.formatMessage(message)}</div>
            </div>
            </div>
        `;
        $("#textchat .msger-chat").append(msgHTML);
        this.scrollToBottom();
    }

    addImageToChat(sender: string, message: any, datetime: Date = new Date(), self: boolean = false){
        var cla = this;
        var side = self ? "right" : "left";
        const msgHTML = `
            <div class="msg ${side}-msg">
            <div class="msg-bubble">
                <div class="msg-info">
                    <div class="msg-info-name">${sender}</div>
                    <div class="msg-info-time">${this.formatDate(datetime)}</div>
                </div>
                <div class="msg-image"><img src="${message.image}"/></div>
                <div class="msg-text">${this.formatMessage(message.text)}</div>
            </div>
            </div>
        `;
        $("#textchat .msger-chat").append(msgHTML);
        setTimeout(function(){
            cla.scrollToBottom();
        }, 200);
        $("#textchat img").off();
        $("#textchat img").on("click", function(){
            cla.app.lightbox.addImage($(this).attr("src"));
        });
    }

    addVideoToChat(sender: string, message: any, datetime: Date = new Date(), self: boolean = false){
        var cla = this;
        var side = self ? "right" : "left";
        const msgHTML = `
            <div class="msg ${side}-msg">
            <div class="msg-bubble">
                <div class="msg-info">
                    <div class="msg-info-name">${sender}</div>
                    <div class="msg-info-time">${this.formatDate(datetime)}</div>
                </div>
                <div class="msg-image"><video src="${message.video}"/></div>
                <div class="msg-text">${this.formatMessage(message.text)}</div>
            </div>
            </div>
        `;
        $("#textchat .msger-chat").append(msgHTML); 
        setTimeout(function(){
            cla.scrollToBottom();
        }, 200);
        $("#textchat video").off();
        $("#textchat video").on("click", function(){
            cla.app.lightbox.addVideo($(this).attr("src"));
        });
    }

    setImageToExtra(image: string){
        this.textchatVueObject.extrainfo = '<img src="'+image+'"/>';
        this.textchatVueObject.extrainfoVisible = true; 
    }

    scrollToBottom(){
        $("#textchat .msger-chat").scrollTop($("#textchat .msger-chat").get(0).scrollHeight); 
    }

    formatMessage(message: any){
        var urlRegex = /(https?:\/\/)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
        message = message.replace(urlRegex, function(url) {
            if(url.substr(0, 4) === "http"){
                return '<a target="_blank" href="' + url + '">' + url + '</a>';
            }else{
                return '<a target="_blank" href="http://' + url + '">' + url + '</a>';
            }
        })
        message = message.replaceAll("\n", "<br>");
        return message;
    }

    formatDate(date) {
        const h = "0" + date.getHours();
        const m = "0" + date.getMinutes();

        const d = "0" + date.getDate();
        const mo = "0" + (date.getMonth()+1);
        const y = date.getFullYear();

        const currentDate = new Date();

        if(date.getDate() == currentDate.getDate() && date.getMonth() == currentDate.getMonth() && date.getFullYear() == currentDate.getFullYear()){
            return `${h.slice(-2)}:${m.slice(-2)}`;
        }      
        return `${d.slice(-2)}.${mo.slice(-2)}.${y} ${h.slice(-2)}:${m.slice(-2)}`;
    }

    checkSize(data: any): boolean{
        var dataJson = JSON.stringify(data);
        var size = new Blob([dataJson]).size;
        console.log("File size: " + size + "kb");
        return size < 262000;
    }

    checkMessageIsImage(message: string){
        var patter = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))$/i;
        return patter.test(message.trim());
    }

    checkMessageIsVideo(message: string){
        var patter = /^(https?:\/\/.*\.(?:mp4|webm|m4v|ogv|ogg))$/i;
        return patter.test(message.trim());
    }

    gotNewMessage(){
        if(!this.isChatVisible()){
            this.setHasNewMessage(true);
        }
    }

    isChatVisible(){
        return $('#textchat').is(':visible');
    }

    setHasNewMessage(hasNewMessage: boolean){
        this.hasNewMessage = hasNewMessage;
        this.app.controls.setNewMessage(hasNewMessage);
    }

}
