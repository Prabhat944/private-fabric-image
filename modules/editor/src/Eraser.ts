import {fabric} from "fabric";
import DMSCanvas from "./DMSCanvas";
import Layer from "./Layer";

export enum EraserModes {
    "GLOBAL",
    "LAYER"
}

export class Eraser {
    private canvas:fabric.Canvas;
    private mode = EraserModes.GLOBAL;
    private selectedLayer: Layer | undefined = undefined;
    private dmsCanvas: DMSCanvas;

    constructor(dmsCanvas:DMSCanvas) {
        this.canvas = dmsCanvas.canvas;
        this.dmsCanvas= dmsCanvas;
        this.brushSize = 100;
    }

    private set active(value:boolean) {
        const _prevBrushSize = this.brushSize;
        const allLayers = this.dmsCanvas.layerManager._layers.value;
        //@ts-ignore
        this.canvas.freeDrawingBrush = new fabric.EraserBrush(this.canvas);
        this.brushSize = _prevBrushSize;
        if(this.mode === EraserModes.GLOBAL) allLayers.forEach(layer=>{
            //@ts-ignore
            layer.fabricRef.set("erasable",true);
        })
        if(this.mode === EraserModes.LAYER) {
            //@ts-ignore
            this.selectedLayer.fabricRef.set("erasable", true);
            allLayers.filter(x=>x!==this.selectedLayer).forEach(x=>{
                //@ts-ignore
                x.fabricRef.set("erasable",false);
            })
        }
        this.canvas.isDrawingMode = value;
    }

    public get active() {
        return this.canvas.isDrawingMode;
    }

    public get brushSize() {
        return this.canvas.freeDrawingBrush.width;  
    }

    public get inverted() {
        //@ts-ignore
        return this.canvas.freeDrawingBrush.inverted;
    }

    public set inverted(value:boolean) {
        //@ts-ignore
        this.canvas.freeDrawingBrush.inverted = value;
    }

    public set brushSize(value:number) {
        this.canvas.freeDrawingBrush.width = value;
    }

    public changeMode(mode:EraserModes, layer?:Layer) {
        if(mode === EraserModes.LAYER && !layer) throw new Error("Cannot Set Eraser to Layer Mode without providing Layer!");
        this.mode = mode;
        if(mode === EraserModes.GLOBAL) return;

        this.selectedLayer = layer;
        
    }

    public on(mode?:EraserModes, layer?:Layer) {
        if(mode && layer) {
            this.changeMode(mode,layer);
            this.canvas.setActiveObject(layer.fabricRef).renderAll();
        }
        this.active=true;
        this.dmsCanvas.canvas.fire("object:modified", {target: this.selectedLayer || this.canvas})
    }

    public off(layer?:Layer) {
        this.active = false;
        try {
            if(layer) this.canvas.setActiveObject(layer.fabricRef).renderAll();
        }
        catch(e) {
            console.log(e);
        }
        this.dmsCanvas.layerManager.enabled = true;
        this.dmsCanvas.canvas.fire("object:modified", {target: this.selectedLayer || this.canvas})
    }

    public toggle(mode?:EraserModes, layer?:Layer) {
        if(mode && layer) {
            this.changeMode(mode,layer);
            this.canvas.setActiveObject(layer.fabricRef).renderAll();
        }
        this.active=!this.active;
        this.dmsCanvas.canvas.fire("object:modified", {target: this.selectedLayer || this.canvas})
    }

}