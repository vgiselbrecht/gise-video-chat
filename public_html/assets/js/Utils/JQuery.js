export class JQueryUtils {
    static addToBigfunction(idname) {
        $("#video-area #" + idname).on("dblclick", function () {
            if ($(this).hasClass("big")) {
                $(this).removeClass("big");
                $("#video-area .video-item").removeClass("unvisible");
            }
            else {
                $(this).addClass("big");
                $("#video-area .video-item:not(.big)").addClass("unvisible");
            }
        });
    }
}
//# sourceMappingURL=JQuery.js.map