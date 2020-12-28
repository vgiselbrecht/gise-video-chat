export class Textchat {
    constructor(app) {
        this.textchatMessageType = 'textchat';
        this.app = app;
        this.initialElements();
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
                    cla.addTextToChat("You", this.message);
                    this.message = "";
                }
            }
        });
    }
    addNewMessageToChat(message, partner) {
        if (message.text !== undefined) {
            this.addTextToChat(partner.getName(), message.text);
        }
    }
    addTextToChat(sender, message) {
        this.textchatVueObject.result += sender + ": " + message + "<br>";
    }
}
//# sourceMappingURL=Textchat.js.map