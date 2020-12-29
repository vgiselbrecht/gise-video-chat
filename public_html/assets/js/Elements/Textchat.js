import { IndexedDB } from "../Database/IndexedDB.js";
export class Textchat {
    constructor(app) {
        this.dbVersion = 1;
        this.textchatMessageType = 'textchat';
        this.textchatDatabaseName = 'chat';
        this.textchatDatabaseObjectName = 'textchat';
        this.textchatMessageTypetext = 'texz';
        this.app = app;
        this.initialElements();
        this.initialDatabase();
    }
    initialElements() {
        let cla = this;
        this.textchatVueObject = new Vue({
            el: '#textchat',
            data: {
                message: "",
                result: "",
            },
            methods: {
                sendMessage: function () {
                    cla.app.sendMessageToAllPartners({ type: cla.textchatMessageType, message: { text: this.message } });
                    cla.addMessage("Du", this.message, new Date(), true);
                    this.message = "";
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
    }
    addMessage(sender, message, datetime = new Date(), self = false, type = this.textchatMessageTypetext) {
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
    addMessageToChat(sender, message, datetime = new Date(), self = false, type = this.textchatMessageTypetext) {
        if (type === this.textchatMessageTypetext) {
            this.addTextToChat(sender, message, datetime, self);
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
    scrollToBottom() {
        $("#textchat .msger-chat").scrollTop($("#textchat .msger-chat").get(0).scrollHeight);
    }
    formatMessage(message) {
        var urlRegex = /(https?:\/\/[^\s]+)/g;
        message = message.replace(urlRegex, function (url) {
            return '<a target="_blank" href="' + url + '">' + url + '</a>';
        });
        return message;
    }
    formatDate(date) {
        const h = "0" + date.getHours();
        const m = "0" + date.getMinutes();
        return `${h.slice(-2)}:${m.slice(-2)}`;
    }
}
//# sourceMappingURL=Textchat.js.map