export class JQueryUtils{

    static addToBigfunction(idname: string): void{
        $("#video-area #"+idname).on("dblclick", function(){
            if($(this).hasClass("big")){
                $(this).removeClass("big");
                $("#video-area .video-item").show();
            }else{
                $(this).addClass("big");
                $("#video-area .video-item:not(.big)").hide();
            }
        });
    }

}