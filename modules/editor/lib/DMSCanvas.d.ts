import { fabric } from "fabric";
import { CanvasFontStyles, DMSCanvasFile, IImageOptions, IPixelDimensions } from "./Interfaces";
import LayerManager from "./LayerManager";
import ZoomAndPanManager from "./ZoomAndPanManager";
export default class DMSCanvas {
    id: any;
    canvas: fabric.Canvas;
    layerManager: LayerManager;
    dimensions: any;
    originalSize: IPixelDimensions;
    zoomAndPanManager: ZoomAndPanManager;
    private fontManager;
    backgroundColor: string | fabric.Pattern | undefined;
    backgroundImage: string | fabric.Image | undefined;
    constructor(id: string, dimensions: IPixelDimensions, originalSize: IPixelDimensions);
    private init;
    private createCanvas;
    add: (...fabricObjects: fabric.Object[]) => void;
    drawRectangle: (options: fabric.IRectOptions) => void;
    set selection(value: boolean);
    get selection(): boolean;
    set penMode(value: boolean);
    get penMode(): boolean;
    set penColor(value: string);
    addImageFromUrl: (options: IImageOptions) => Promise<void>;
    addText: (text: string, fontStyle: CanvasFontStyles) => Promise<void>;
    undo: () => void;
    redo: () => void;
    resize: (dimensions: IPixelDimensions) => void;
    resizeViewport: (dimensions: IPixelDimensions) => void;
    save: () => Promise<DMSCanvasFile>;
    load: (file: DMSCanvasFile) => Promise<void>;
    private waitForLayer;
    /**
     * @description Please don't use this in parallel. Only one layer can be added at once. Wait for that layer to be added before adding a new layer, otherwise wrong reference can be returned. (You may receive any other layer than the one you have added)
     * @param layer
     * @returns
     */
    private addLayerFromSerializedData;
    toBase64Url(): string;
    enableCopyPaste(): void;
    setBackgroundFromURL: (url: string, scaleX?: number, scaleY?: number) => Promise<void>;
}
