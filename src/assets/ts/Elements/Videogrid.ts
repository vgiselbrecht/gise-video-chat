export class Videogrid{

    recalculateLayout() {
        const gallery = document.getElementById("video-area");
        if (!gallery) return;
        var videoCount = $(gallery).find(".video-item:not(.hide)").length;
        const screenWidth = gallery.offsetWidth;
        const screenHeight = gallery.offsetHeight;

        var aspectRatio = 4 / 3;
        if(videoCount <= 2){
            var lastElementVideo = $(gallery).find(".video-item:not(.hide)").last().find("video")[0];
            if(lastElementVideo !== undefined && lastElementVideo.videoWidth > 0 && lastElementVideo.videoHeight > 0){
                aspectRatio = lastElementVideo.videoWidth / lastElementVideo.videoHeight;
            }
        }        

        if(videoCount <= 4 && videoCount > 1){
            $(gallery).addClass("yoursmall");
            videoCount -= 1;
        } else {
            $(gallery).removeClass("yoursmall");
        } 

        // or use this nice lib: https://github.com/fzembow/rect-scaler
        function calculateLayout(
            containerWidth: number,
            containerHeight: number,
            videoCount: number,
            aspectRatio: number
        ): { width: number; height: number; cols: number } {
            let bestLayout = {
                area: 0,
                cols: 0,
                rows: 0,
                width: 0,
                height: 0
            };

            // brute-force search layout where video occupy the largest area of the container
            for (let cols = 1; cols <= videoCount; cols++) {
                const rows = Math.ceil(videoCount / cols);
                const hScale = containerWidth / (cols * aspectRatio);
                const vScale = containerHeight / rows;
                let width;
                let height;
                if (hScale <= vScale) {
                    width = Math.floor(containerWidth / cols);
                    height = Math.floor(width / aspectRatio);
                } else {
                    height = Math.floor(containerHeight / rows);
                    width = Math.floor(height * aspectRatio);
                }
                const area = width * height;
                if (area > bestLayout.area) {
                    bestLayout = {
                    area,
                    width,
                    height,
                    rows,
                    cols
                    };
                }
            }
            return bestLayout;
        }

        const { width, height, cols } = calculateLayout(
            screenWidth,
            screenHeight,
            videoCount,
            aspectRatio
        );

        gallery.style.setProperty("--width", width + "px");
        gallery.style.setProperty("--height", height + "px");
        gallery.style.setProperty("--cols", cols + "");
    }

    init(){
        var cla = this;
        window.addEventListener("resize", this.recalculateLayout);
        this.recalculateLayout();
        setInterval(function(){
            cla.recalculateLayout();
        }, 2000);
    }


}