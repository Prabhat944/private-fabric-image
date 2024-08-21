// import EventEmitter from "events";
import { fabric } from "fabric";
import { BehaviorSubject, Subscription } from "rxjs";
import FontManager from "./FontManager";
import ImageLayer from "./ImageLayer";
import Layer from "./Layer";
import TextLayer from "./TextLayer";
import SVGLayer from "./SVGLayer";
export default class LayerManager {
  public _layers = new BehaviorSubject<Layer[]>([]);
  public layers = this._layers.asObservable();

  public _selectedLayer = new BehaviorSubject<Layer | undefined>(undefined);
  public selectedLayer = this._selectedLayer.asObservable();

  public currentSelection: Layer[] = [];

  private canvas: fabric.Canvas;
  private _enabled:boolean = true;
  private fontManager: FontManager;

  private eventListeners = new Map<string, (e: any) => void>();

  constructor(_canvas: fabric.Canvas, fontManager: FontManager) {
    this.canvas = _canvas;
    this.fontManager = fontManager;
    this.addObjectEventListeners();
    this.addSelectionEventListeners();
  }

  private setLayers(layers: Layer[]) {
    this._layers.next([...layers]);
  }

  public get enabled() {
    return this._enabled;
  }

  public set enabled(value:boolean) {
    this._enabled = value;
    this.removeSelectionEventListeners();
    this.removeObjectEventListeners();
    if (value) {
      this.addObjectEventListeners();
      this.addSelectionEventListeners();
    }
  }

  public addSelectionEventListeners() {

    this.eventListeners.set("selection:updated", (x: any) => {
      if(x.selected.length > 0) {
        this.canvas.setActiveObject(x.selected[0]);
      }

      if (!Array.isArray(x.selected) && !Array.isArray(x.deselected)) return;
      const currentLayers = this._layers.getValue();
      x.selected?.forEach((layer: fabric.Object) => {
        const _layer = currentLayers.find((y) => {
          return y.fabricRef === layer;
        });
        if (_layer) this.currentSelection.push(_layer);
      });
      if (x.deselected?.length >= 1)
        this.currentSelection = this.currentSelection.filter((y) => {
          let flag = false;
          for (const layer of x.deselected) {
            if (y.fabricRef !== layer) flag = true;
          }
          return flag;
        });

      if (this.currentSelection.length === 1)
        this._selectedLayer.next(this.currentSelection?.[0]);
      else this._selectedLayer.next(undefined);
    });

    this.eventListeners.set("selection:created", (x) => {
      if(x.selected.length > 0) {
        this.canvas.setActiveObject(x.selected[0]);
      }

      this.currentSelection = this._layers.getValue().filter((currentLayer) => {
        if (x.selected === undefined || !Array.isArray(x.selected))
          return false;
        for (const layer of x.selected) {
          if (layer === currentLayer.fabricRef) {
            return true;
          }
        }
      });
      if (this.currentSelection.length === 1)
        this._selectedLayer.next(this.currentSelection?.[0]);
      else this._selectedLayer.next(undefined);
    });

    this.eventListeners.set("selection:cleared",() => {
      this._selectedLayer.next(undefined);
      this.currentSelection = [];
    });
    
  //   for (const [key, value] of Object.entries(this.eventListeners)) { 
  //     this.canvas.on(key,value);
  // }
  

    this.canvas.on("selection:created", this.eventListeners.get("selection:created"));

    this.canvas.on("selection:cleared", this.eventListeners.get("selection:cleared"));

    this.canvas.on("selection:updated", this.eventListeners.get("selection:updated"));
  }

  public removeSelectionEventListeners() {
    this.canvas.off("selection:updated", this.eventListeners.get("selection:updated"));
    this.canvas.off("selection:created", this.eventListeners.get("selection:created"));
    this.canvas.off("selection:cleared", this.eventListeners.get("selection:cleared"));
    // for (const [key, value] of Object.entries(this.eventListeners)) { 
    //   this.canvas.off(key,value);
    // }
  }

  private addObjectEventListeners() {
    this.eventListeners.set("object:added", (x) => {
      if (!x.target) return;
      const layers = this._layers.getValue();
      let layer;
      const numberOfLayersOfSameType = layers.filter((y) => y.fabricRef.type == x.target?.type).length;
      let id = (x?.target?.type || "") + (numberOfLayersOfSameType + 1).toString();
      let counter = 1;
      while(layers.find(x=>x.id===id)) {
        id = (x.target.type || "") + (numberOfLayersOfSameType + 1+counter).toString();
      }
      switch (x.target.type) {
        case "image":
          layer = new ImageLayer(x.target,this, id);
          break;
        case "textbox":
          layer = new TextLayer(x.target, this.fontManager, this, id);
          break;
        case "circle":
        case "polygon":
        case "path":
        case "ellipse":
        case "rect":
        case "square":
          layer = new SVGLayer(x.target, this, id);
          break;
        default:
          layer = new Layer(x.target,this, id);
      }
      layers.unshift(layer);
      this.setLayers(layers);
    });
    this.canvas.on("object:added", this.eventListeners.get("object:added"));
  }

  private removeObjectEventListeners() {
    this.canvas.off("object:added", this.eventListeners.get("object:added"));
  }

  moveLayerToIndex(i: number, layer: Layer) {
    layer.fabricRef.canvas?.moveTo(
      layer.fabricRef,
      this._layers.getValue().length - i - 1
    );
    try {
    this.canvas.renderAll();
    } catch (e) {
      console.error(e);
    }
    const layers: Layer[] = [];
    layer.fabricRef.canvas?.getObjects().forEach((object) => {
      const layer = this._layers.getValue().find((x) => {
        return x.fabricRef === object;
      });
      if (layer) layers.unshift(layer);
    });
    this.setLayers(layers);
    this.canvas?.fire("object:modified", { target: layer.fabricRef });
  }

  moveLayerUp(layer: Layer) {
    const index = this._layers.getValue().findIndex((x) => x === layer);
    this.moveLayerToIndex(index - 1, layer);
  }

  moveLayerDown(layer: Layer) {
    const index = this._layers.getValue().findIndex((x) => x === layer);
    this.moveLayerToIndex(index + 1, layer);
  }

  bringToFront(layer: Layer) {
    this.moveLayerToIndex(0, layer);
    this.canvas?.fire("object:modified", { target: layer.fabricRef });
  }

  bringToBack(layer: Layer) {
    this.moveLayerToIndex(this._layers.getValue().length - 1, layer);
    this.canvas?.fire("object:modified", { target: layer.fabricRef });
  }

  delete(layer: Layer) {
    const layers = Array.from(this._layers.getValue());
    const index = layers.findIndex((x) => x.id == layer.id);
    console.log("Deleting", layer.fabricRef);
    layers[index].fabricRef.canvas?.remove(layers[index].fabricRef);
    layers[index].fabricRef.canvas?.renderAll();
    layers.splice(index, 1);
    this._layers.next(layers);
  }

  public deleteAll() {
    console.log("Called Delete All", this._layers.getValue(), this._layers, this._layers.value);
    this._layers.value.forEach((layer) => this.delete(layer));
    return new Promise<void>((res, rej) => {
      let sub:Subscription;
      sub = this.layers.subscribe((layers) => {
        console.log({layers}, "HIstory Manger", "Subscription")
        if (layers.length === 0){ 
          sub?.unsubscribe?.();
          res();
        }
        window.setTimeout(
          () => {
            rej(new Error("Layer Manager: Delete All TIMEOUT"));
            sub?.unsubscribe?.();
          },
          100000
        );
      });
    });
  }
}
