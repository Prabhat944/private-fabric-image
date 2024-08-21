import { Observable } from "rxjs";
import Layer from "./Layer";
import { IPixelDimensions, SerializedFillInfo } from "./Interfaces";
import { fabric } from "fabric";

export default class Fill {

    public backgroundImageSrc: string;
    private backgroundImage: HTMLImageElement | null = null;
    public backgroundImageOffsetX: number = 0;
    public backgroundImageOffsetY: number = 0;
    public backgroundImageHeight: number = 0;
    public backgroundImageWidth: number = 0;
    public backgroundImageZoom: number = 1.0; 
    public backgroundColor: string = "#FFFFFF";
    public opacity: number = 0;
    public dimensions:IPixelDimensions = {height: 0,width:0}
    public dimensionsObservable:Observable<IPixelDimensions>;
    public canvas = document.createElement("canvas");
    public ctx: CanvasRenderingContext2D | null;
    public positionX: number = 0; // -100 to 100
    public positionY: number = 0; // -100 to 100
    public imageRotation: number = 0;
    public imageOpacity: number = 1;


    constructor(height:number,width:number) {
        this.ctx = this.canvas.getContext('2d');
        this.dimensions.height = this.canvas.height = height;
        this.dimensions.width = this.canvas.width = width;
    }

    public setBackgroundImage(imageElement: HTMLImageElement) {
        this.backgroundImage = imageElement;
        const aspectRatio = this.backgroundImage.width / this.backgroundImage.height;
        this.backgroundImageHeight = this.dimensions.height;
        this.backgroundImageWidth = this.dimensions.height * aspectRatio;
        if (this.dimensions.width / this.dimensions.height < aspectRatio) {
            this.backgroundImageHeight = this.dimensions.width / aspectRatio;
            this.backgroundImageWidth = this.dimensions.width;
        }
        this.backgroundImageOffsetX = Number(this.dimensions.width - this.backgroundImageWidth) / 2;
        this.backgroundImageOffsetY = Number(this.dimensions.height - this.backgroundImageHeight) / 2;
        this.backgroundImageSrc = imageElement.src;
        
    }

    private cloneAndRedrawCanvas(): HTMLCanvasElement {
        const clone = this.canvas.cloneNode(true) as HTMLCanvasElement;
        const cloneCtx = clone.getContext('2d');
        if(!cloneCtx) return clone;
        cloneCtx.clearRect(0, 0, clone.width, clone.height);

        cloneCtx.fillStyle = this.backgroundColor;
        cloneCtx.fillRect(0, 0, this.dimensions.width, this.dimensions.height);
        
        // Calculate the position offsets based on the percentages
        

        if (this.backgroundImage) {
            const zoomedWidth = this.backgroundImageWidth * this.backgroundImageZoom;
            const zoomedHeight = this.backgroundImageHeight * this.backgroundImageZoom;
            const offsetX = (this.positionX / 100) * ((this.dimensions.width + zoomedWidth)/2);
            const offsetY = (this.positionY / 100) * ((this.dimensions.height + zoomedHeight)/2);
            const zoomedOffsetX = this.backgroundImageOffsetX - ((zoomedWidth - this.backgroundImageWidth) / 2) + offsetX;
            const zoomedOffsetY = this.backgroundImageOffsetY - ((zoomedHeight - this.backgroundImageHeight) / 2) + offsetY;
            cloneCtx.save();
            cloneCtx.globalAlpha = this.imageOpacity;
            cloneCtx.translate(zoomedOffsetX + zoomedWidth / 2, zoomedOffsetY + zoomedHeight / 2);
            cloneCtx.rotate(this.imageRotation * Math.PI / 180);
            cloneCtx.drawImage(this.backgroundImage, -zoomedWidth / 2, -zoomedHeight / 2, zoomedWidth, zoomedHeight);
            cloneCtx.restore();
        }



        // cloneCtx.scale(this.zoomFactor, this.zoomFactor);
        return clone;
    }

    public redraw() {
        
        return new fabric.Pattern({
            source:this.cloneAndRedrawCanvas() as any,
            crossOrigin:"anonymous",
            repeat:"no-repeat",
            offsetX:0,
            offsetY:0
        })
    }

    public serialize(): SerializedFillInfo {
        return {
            backgroundImageSrc: this.backgroundImageSrc,
            backgroundImageOffsetX: this.backgroundImageOffsetX,
            backgroundImageOffsetY: this.backgroundImageOffsetY,
            backgroundImageHeight: this.backgroundImageHeight,
            backgroundImageWidth: this.backgroundImageWidth,
            backgroundImageZoom: this.backgroundImageZoom,
            backgroundColor: this.backgroundColor,
            positionX: this.positionX,
            positionY: this.positionY,
            imageRotation: this.imageRotation,
            imageOpacity: this.imageOpacity,
            dimensions: this.dimensions
        };
    }

    public async enliven(data: SerializedFillInfo) {
        if(data.backgroundImageSrc) {
            const img = new Image(); 
            img.crossOrigin = "anonymous";
            img.src = data.backgroundImageSrc;
            try {
                await new Promise((resolve, reject) =>{ img.onload = resolve, img.onerror = reject});
                this.setBackgroundImage(img); // Set the loaded image as the background
            } catch(err) {
                console.error('Error loading image:', err);
            }
        }

        this.backgroundColor = data.backgroundColor;
        this.backgroundImageZoom = data.backgroundImageZoom;
        // this.backgroundImageHeight = data.backgroundImageHeight;
        // this.backgroundImageWidth = data.backgroundImageWidth;
        // this.backgroundImageOffsetX = data.backgroundImageOffsetX;
        // this.backgroundImageOffsetY = data.backgroundImageOffsetY;
        this.backgroundColor = data.backgroundColor;
        this.imageOpacity = data.imageOpacity;
        this.imageRotation = data.imageRotation;
        // this.dimensions = data.dimensions;
        this.positionX = data.positionX;
        this.positionY = data.positionY;
    }

}