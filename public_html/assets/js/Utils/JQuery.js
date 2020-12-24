export class JQueryUtils {
    static addToBigfunction(idname) {
        $("#video-area #" + idname).on("dblclick", function () {
            if ($(this).hasClass("big")) {
                $(this).removeClass("big");
                $("#video-area .video-item").show();
            }
            else {
                $(this).addClass("big");
                $("#video-area .video-item:not(.big)").hide();
            }
        });
    }
}
//# sourceMappingURL=JQuery.js.map