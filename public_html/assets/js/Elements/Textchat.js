import { IndexedDB } from "../Database/IndexedDB.js";
export class Textchat {
    constructor(app) {
        this.dbVersion = 1;
        this.textchatMessageType = 'textchat';
        this.textchatDatabaseName = 'chat';
        this.textchatDatabaseObjectName = 'textchat';
        this.textchatMessageTypeText = 'text';
        this.textchatMessageTypeImage = 'image';
        this.textchatMaxImageSize = 800;
        this.app = app;
        this.initialElements();
        this.initialDatabase();
        var cla = this;
    }
    initialElements() {
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
                sendMessage: function () {
                    if (this.image) {
                        var message = {
                            image: {
                                image: this.image,
                                text: this.message
                            }
                        };
                        var data = { type: cla.textchatMessageType, message: message };
                        if (cla.checkSize(data)) {
                            cla.app.sendMessageToAllPartners(data);
                            cla.addMessage("Du", message.image, new Date(), true, cla.textchatMessageTypeImage);
                        }
                        else {
                            alert("Datei ist zu groß für den Versand, die Datei darf nur 256kb groß sein!");
                            return;
                        }
                    }
                    else if (this.message) {
                        cla.app.sendMessageToAllPartners({ type: cla.textchatMessageType, message: { text: this.message } });
                        cla.addMessage("Du", this.message, new Date(), true);
                    }
                    this.image = null;
                    this.extrainfoVisible = false;
                    this.message = "";
                },
                addfile: function (e) {
                    var vue = this;
                    var fileList = e.target.files;
                    if (!fileList.length)
                        return;
                    let reader = new FileReader();
                    if (fileList[0] && fileList[0].type.match(/image.*/)) {
                        reader.onload = (readerEvent) => {
                            /*vue.image = reader.result.toString();
                            cla.setImageToExtra(vue.image);*/
                            var image = new Image();
                            image.onload = function (imageEvent) {
                                var canvas = document.createElement('canvas'), max_size = cla.textchatMaxImageSize, width = image.width, height = image.height;
                                if (width > height) {
                                    if (width > max_size) {
                                        height *= max_size / width;
                                        width = max_size;
                                    }
                                }
                                else {
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
                            };
                            image.src = readerEvent.target.result.toString();
                        };
                        reader.readAsDataURL(fileList[0]);
                    }
                    e.target.value = "";
                },
                closeExtra: function () {
                    this.image = null;
                    this.extrainfoVisible = false;
                }
            }
        });
    }
    initialDatabase() {
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
        this.database.initDatabase(this.textchatDatabaseName, this.dbVersion, this.databaseStructure, function (success, caller) {
            if (success) {
                caller.loadMessagesFromDB();
            }
            else {
                console.log("Cannot create DB!");
            }
        }, this);
    }
    loadMessagesFromDB() {
        var query = {
            element: {
                name: 'room',
                unique: false
            },
            value: this.app.room
        };
        this.database.read(this.databaseStructure[this.textchatDatabaseObjectName], query, function (success, data, caller) {
            if (success) {
                for (var i = 0; i < data.length; i++) {
                    caller.addMessageToChat(data[i].partnerName, data[i].message, data[i].date, data[i].self, data[i].type);
                }
            }
            else {
                console.log("Cannot read message to DB!");
            }
        }, this);
    }
    addNewPartnerMessageToChat(message, partner) {
        if (message.text !== undefined) {
            this.addMessage(partner.getName(), message.text);
        }
        else if (message.image !== undefined) {
            this.addMessage(partner.getName(), message.image, new Date(), false, this.textchatMessageTypeImage);
        }
    }
    addMessage(sender, message, datetime = new Date(), self = false, type = this.textchatMessageTypeText) {
        this.addMessageToChat(sender, message, datetime, self, type);
        var data = {
            room: this.app.room,
            partnerName: sender,
            date: datetime,
            self: self,
            message: message,
            type: type
        };
        this.database.add(this.databaseStructure[this.textchatDatabaseObjectName], data, function (success, caller) {
            if (!success) {
                console.log("Cannot add message to DB!");
            }
        }, this);
    }
    addMessageToChat(sender, message, datetime = new Date(), self = false, type = this.textchatMessageTypeText) {
        if (type === this.textchatMessageTypeText) {
            this.addTextToChat(sender, message, datetime, self);
        }
        else if (type === this.textchatMessageTypeImage) {
            this.addImageToChat(sender, message, datetime, self);
        }
    }
    addTextToChat(sender, message, datetime = new Date(), self = false) {
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
    addImageToChat(sender, message, datetime = new Date(), self = false) {
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
        setTimeout(function () {
            cla.scrollToBottom();
        }, 100);
        $("#textchat img").off();
        $("#textchat img").on("click", function () {
            cla.app.lightbox.addImage($(this).attr("src"));
        });
    }
    setImageToExtra(image) {
        this.textchatVueObject.extrainfo = '<img src="' + image + '"/>';
        this.textchatVueObject.extrainfoVisible = true;
    }
    scrollToBottom() {
        $("#textchat .msger-chat").scrollTop($("#textchat .msger-chat").get(0).scrollHeight);
    }
    formatMessage(message) {
        var urlRegex = /(https?:\/\/[^\s]+)/g;
        message = message.replace(urlRegex, function (url) {
            return '<a target="_blank" href="' + url + '">' + url + '</a>';
        });
        message = message.replaceAll("\n", "<br>");
        return message;
    }
    formatDate(date) {
        const h = "0" + date.getHours();
        const m = "0" + date.getMinutes();
        return `${h.slice(-2)}:${m.slice(-2)}`;
    }
    checkSize(data) {
        var dataJson = JSON.stringify(data);
        var size = new Blob([dataJson]).size;
        console.log("File size: " + size + "kb");
        return size < (256 * 1024);
    }
}
//# sourceMappingURL=Textchat.js.map