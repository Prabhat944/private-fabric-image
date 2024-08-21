import DMSCanvas from "./DMSCanvas";
import { fabric } from "fabric";
import { IPixelDimensions } from "./Interfaces";
import { BehaviorSubject } from "rxjs";

const CROP_RECT_MIN_SIZE = 100;
const DEFAULT_CROP_RECT_SIZE = 0.75;


export default class CropAndResizeManager {
    dmsCanvas!:DMSCanvas;
    cropOverlay: fabric.Rect[] = [];
    cropRect: fabric.Rect | null = null;
    public $cropSize = new BehaviorSubject({height:0, width:0});
    public cropSize = this.$cropSize.asObservable();
    public $cropPosition = new BehaviorSubject({top:0, left:0});
    public cropPosition = this.$cropPosition.asObservable();

    constructor(canvas:DMSCanvas) {
        this.dmsCanvas = canvas;
    }

    public enterCropMode() {
        this.dmsCanvas.shouldFireModifiedEvent = false;
        this.dmsCanvas.layerManager.enabled = false;
        const canvas = this.dmsCanvas.canvas;
    
        // Make all existing objects unselectable
        canvas.getObjects().forEach((obj) => {
            obj.selectable = false;
        });
    
        // Create the four semi-transparent overlay rectangles
        const rectParams = [
            { left: 0, top: 0, width: canvas.width, height: canvas.height / 4 },
            { left: 0, top: canvas.height / 4, width: canvas.width / 4, height: canvas.height / 2 },
            { left: 3 * canvas.width / 4, top: canvas.height / 4, width: canvas.width / 4, height: canvas.height / 2 },
            { left: 0, top: 3 * canvas.height / 4, width: canvas.width, height: canvas.height / 4 }
        ];
    
        this.cropOverlay = rectParams.map((params) => {
            const rect = new fabric.Rect({
                ...params,
                fill: 'rgba(0,0,0,0.2)',
                selectable: false
            });
            canvas.add(rect);
            return rect;
        });
    
        // Create the crop rectangle
        this.cropRect = new fabric.Rect({
            left: canvas.width / 4,
            top: canvas.height / 4,
            width: canvas.width / 2,
            height: canvas.height / 2,
            fill: 'transparent',
            stroke: 'white',
            strokeWidth: 1,
            hasBorders: true,
            hasControls: true,
        });
        // this.cropRect.on("moving", (e) => {
        //     this.cropSize = {height:e.target.height, width: e.target.width};
        // });
        this.$cropSize.next({height:canvas.height / 2, width: canvas.height / 2});
        this.$cropPosition.next({top:canvas.height / 4, left: canvas.width / 4});



        canvas.add(this.cropRect);
    
        // Update the overlay's rectangles when the crop rectangle is modified
        ['moving', 'scaling', 'modified'].forEach((eventName) => {
            this.cropRect.on(eventName, () => {
                const cropBounds = this.cropRect.getBoundingRect(true, true);
                if (this.cropRect) {
                    //Restrict bounding box to this.dmsCanvas.originalSize
                    if (cropBounds.left < 0) {
                        this.cropRect.set({ left: 0 });
                        cropBounds.left = 0;
                    }
                    if (cropBounds.top < 0) {
                        this.cropRect.set({ top: 0 });
                        cropBounds.top = 0;
                    }
                    if (cropBounds.left + cropBounds.width > this.dmsCanvas.originalSize.width) {
                        this.cropRect.set({ left: this.dmsCanvas.originalSize.width - cropBounds.width });
                        cropBounds.left = this.dmsCanvas.originalSize.width - cropBounds.width;
                    }
                    if (cropBounds.top + cropBounds.height > this.dmsCanvas.originalSize.height) {
                        this.cropRect.set({ top: this.dmsCanvas.originalSize.height - cropBounds.height });
                        cropBounds.top = this.dmsCanvas.originalSize.height - cropBounds.height;
                    }
                }
                const offset = 0;
        
                const topRect = this.cropOverlay[0];
                const leftRect = this.cropOverlay[1];
                const rightRect = this.cropOverlay[2];
                const bottomRect = this.cropOverlay[3];
                
                topRect.set({ height: cropBounds.top + offset });
                leftRect.set({ width: cropBounds.left + offset, height: cropBounds.height + offset * 2, top: cropBounds.top - offset });
                rightRect.set({ width: canvas.width - cropBounds.left - cropBounds.width + offset, height: cropBounds.height + offset * 2, left: cropBounds.left + cropBounds.width - offset, top: cropBounds.top - offset });
                bottomRect.set({ height: canvas.height - cropBounds.top - cropBounds.height + offset, top: cropBounds.top + cropBounds.height - offset });
        
                canvas.renderAll();
                this.$cropSize.next({height:cropBounds.height, width: cropBounds.width});
                this.$cropPosition.next({top:cropBounds.top, left: cropBounds.left});
            });
        });
        canvas.setActiveObject(this.cropRect);
        canvas.renderAll();
    }


    public exitCropMode() {
        const canvas = this.dmsCanvas.canvas;
    
        // Make all existing objects selectable again
        canvas.getObjects().forEach((obj) => {
            obj.selectable = true;
        });
    
        // Remove the overlay rectangles
        if (this.cropOverlay) {
            this.cropOverlay.forEach(rect => canvas.remove(rect));
            this.cropOverlay = null;
        }
    
        // Remove the crop rectangle
        if (this.cropRect) {
            canvas.remove(this.cropRect);
            this.cropRect = null;
        }

        this.$cropPosition.next({top:0, left: 0});
        this.$cropSize.next({height:0, width: 0});
    
        canvas.renderAll();
        this.dmsCanvas.shouldFireModifiedEvent = true;
        this.dmsCanvas.layerManager.enabled = true;
    }

    public cropAndResize(targetSize:IPixelDimensions) {
        
        if (!this.cropRect) {
            console.error('Crop rectangle is not defined');
            return;
        }
    
        // Get the crop area bounds
        const left = this.cropRect.get('left');
        const top = this.cropRect.get('top');
        const width = this.cropRect.get('width') * this.cropRect.get('scaleX');
        const height = this.cropRect.get('height') * this.cropRect.get('scaleY');
        this.exitCropMode();
        // Translate all objects on the canvas by the top-left point of the crop rectangle
        this.dmsCanvas.canvas.getObjects().forEach((obj) => {
            obj.left -= left;
            obj.top -= top;
            obj.setCoords(); // Need to call this method to update object's coordinates
            obj.fire('modified', { target: obj });
            obj.fire('moving', { transform: {target: obj }});
        });
    
        this.dmsCanvas.originalSize = { width, height };
        
        if(this.dmsCanvas.canvas) this.dmsCanvas.canvas?.setHeight(height);
        if(this.dmsCanvas.canvas) this.dmsCanvas.canvas?.setWidth(width);
        this.dmsCanvas.zoomAndPanManager.update();
        this.dmsCanvas.resize(targetSize);
        // this.enterCropMode();
    }

    // public set cropSize(size: IPixelDimensions) {
    //     this.cropSize = size;
    // }

    // public get cropSize() {
    //     return this.cropSize;
    // }

    // public get cropAspectRatio() {

    // }



    public getCropAspectRatio() {

    }

    // public set

}
