import Layer from "./Layer";
import {fabric} from 'fabric';
import LayerManager from "./LayerManager";
import { IObjectOptions } from "fabric/fabric-impl";
import { BehaviorSubject } from "rxjs";
import ImageLayer from "./ImageLayer";
import { IPixelDimensions, SerializedFillInfo, SerializedSVGLayerInfo } from "./Interfaces";
import Fill from "./Fill";

export default class SVGLayer extends Layer {

    public $pattern = new BehaviorSubject<undefined | string | fabric.Pattern | fabric.Gradient>(undefined);
    public fillObservable = this.$pattern.asObservable();
    public fill!: Fill;
    public url: string;

    constructor(obj: fabric.Object, layerManager:LayerManager, name?: string) {
        super(obj, layerManager, name);
        this.fill = new Fill(obj.height,obj.width);
        this.pattern = this.fill.redraw();
        this.setAspectRatioLock(true);
        this.type = "svg";
    }

    public set pattern(value: string | fabric.Pattern | fabric.Gradient) {
        this.fabricRef.set("fill",value);
        this.$pattern.next(value);
        this.fabricRef.canvas.renderAll();
        this.fabricRef.canvas?.fire("object:modified", { target: this.fabricRef });
    }

    public get pattern() {
        return this.fabricRef.get("fill");
    }
    
    public async setFillFromImageLayer(imageLayer: ImageLayer) {
        const image = imageLayer.imageFabricRef.getElement() as HTMLImageElement;
        this.fill.setBackgroundImage(image);
        this.pattern = this.fill.redraw();
    }

    public set backgroundColor(color:string) {
        this.fill.backgroundColor = color;
        this.pattern = this.fill.redraw();
    }

    public get backgroundColor() {
        return this.fill.backgroundColor;
    }
    
    public set backgroundImageZoom(zoomValue: number) {
        this.fill.backgroundImageZoom = zoomValue;
        this.pattern = this.fill.redraw();
    }

    public get backgroundImageZoom() {
        return this.fill.backgroundImageZoom;
    }

    public get backgroundPositionX() {
        return this.fill.positionX;
    }

    public set backgroundPositionX(value:number) {
        this.fill.positionX = value;
        this.pattern = this.fill.redraw();
    }

    public get backgroundPositionY() {
        return this.fill.positionY;
    }

    public set backgroundPositionY(value:number) {
        this.fill.positionY = value;
        this.pattern = this.fill.redraw();
    }

    public get backgroundOpacity() {
        return this.fill.imageOpacity;
    }

    public set backgroundOpacity(value: number) {
        this.fill.imageOpacity = value;
        this.pattern = this.fill.redraw();
    }

    public get borderThickness() {
        return this.fabricRef.strokeWidth;
    }

    public set borderThickness(value:number) {
        this.fabricRef.strokeWidth = value;
        this.fabricRef.canvas.renderAll();
    }

    public get borderColor() {
        return this.fabricRef.stroke;
    }

    public set borderColor(value) {
        this.fabricRef.set("stroke",value);
        this.fabricRef.canvas.renderAll();
    }

    public override async setPropertiesFromSerializedData(data: SerializedSVGLayerInfo) {
        super.setPropertiesFromSerializedData(data);
        await this.fill.enliven(data.fill);

        // Set properties of SVGLayer
        this.borderColor = data.borderColor;
        this.borderThickness = data.borderThickness;
        this.pattern = this.fill.redraw();
        this.fabricRef.canvas.renderAll();
    }
}
