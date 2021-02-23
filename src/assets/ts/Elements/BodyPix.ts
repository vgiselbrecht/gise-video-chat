import { App } from "../app";

declare var bodyPix: any;

export class BodyPix{

    app: App;
    canvas: any;

    constructor(app: App){
        this.app = app;
        this.canvas = document.getElementById("yourVideoCanvas");
    }

    loadBodyPix() {
        var options = {
            architecture: 'MobileNetV1',
            outputStride: 16,
            multiplier: 0.75,
            quantBytes: 2
        }
        bodyPix.load(options)
          .then(net => this.perform(net))
          .catch(err => console.log(err))
      }
      
      async perform(net) {
          while(true){
            const segmentation = await net.segmentPerson(this.app.yourVideo);
        
            const backgroundBlurAmount = 6;
            const edgeBlurAmount = 2;
            const flipHorizontal = false;
        
            bodyPix.drawBokehEffect(
                this.canvas, this.app.yourVideo, segmentation, backgroundBlurAmount,
                edgeBlurAmount, flipHorizontal);
          }
      }

}