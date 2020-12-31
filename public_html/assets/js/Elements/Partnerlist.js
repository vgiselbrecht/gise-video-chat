export class Partnerlist {
    constructor(app) {
        this.app = app;
        this.initialElements();
    }
    initialElements() {
        var cla = this;
        this.partnerlistVueObject = new Vue({
            el: "#partnerlist",
            data: {
                partnerlist: {}
            }
        });
    }
    setPartnerList(partnerlist) {
        var partner = {};
        partner[0] = {
            name: "Du",
            muted: !this.app.controls.controlsVueObject.microphoneOn
        };
        this.partnerlistVueObject.partnerlist = partnerlist;
    }
}
//# sourceMappingURL=Partnerlist.js.map