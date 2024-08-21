import { fabric } from "fabric";
import { BehaviorSubject } from "rxjs";
import FontManager from "./FontManager";
import Layer from "./Layer";
export default class LayerManager {
    _layers: BehaviorSubject<Layer[]>;
    layers: import("rxjs").Observable<Layer[]>;
    private _selectedLayer;
    selectedLayer: import("rxjs").Observable<Layer>;
    currentSelection: Layer[];
    private canvas;
    constructor(_canvas: fabric.Canvas, fontManager: FontManager);
    private setLayers;
    private addSelectionEventListeners;
    moveLayerToIndex(i: number, layer: Layer): void;
    moveLayerUp(layer: Layer): void;
    moveLayerDown(layer: Layer): void;
    bringToFront(layer: Layer): void;
    bringToBack(layer: Layer): void;
    delete(layer: Layer): void;
    deleteAll(): Promise<void>;
}
