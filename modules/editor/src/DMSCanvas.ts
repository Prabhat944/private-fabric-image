import {fabric} from "fabric";
// import "fabric-history";
// fabric.Canvas.prototype.initialize=function(t){return function(...i){return t.call(this,...i),this._historyInit(),this}}(fabric.Canvas.prototype.initialize),fabric.Canvas.prototype.dispose=function(t){return function(...i){return t.call(this,...i),this._historyDispose(),this}}(fabric.Canvas.prototype.dispose),fabric.Canvas.prototype._historyNext=function(){return JSON.stringify(this.toDatalessJSON(this.extraProps))},fabric.Canvas.prototype._historyEvents=function(){return{"object:added":this._historySaveAction,"object:removed":this._historySaveAction,"object:modified":this._historySaveAction,"object:skewing":this._historySaveAction}},fabric.Canvas.prototype._historyInit=function(){this.historyUndo=[],this.historyRedo=[],this.extraProps=["selectable","editable"],this.historyNextState=this._historyNext(),this.on(this._historyEvents())},fabric.Canvas.prototype._historyDispose=function(){this.off(this._historyEvents())},fabric.Canvas.prototype._historySaveAction=function(){if(this.historyProcessing)return;const t=this.historyNextState;this.historyUndo.push(t),this.historyNextState=this._historyNext(),this.fire("history:append",{json:t})},fabric.Canvas.prototype.undo=function(t){this.historyProcessing=!0;const i=this.historyUndo.pop();i?(this.historyRedo.push(this._historyNext()),this.historyNextState=i,this._loadHistory(i,"history:undo",t)):this.historyProcessing=!1},fabric.Canvas.prototype.redo=function(t){this.historyProcessing=!0;const i=this.historyRedo.pop();i?(this.historyUndo.push(this._historyNext()),this.historyNextState=i,this._loadHistory(i,"history:redo",t)):this.historyProcessing=!1},fabric.Canvas.prototype._loadHistory=function(t,i,s){var o=this;this.loadFromJSON(t,function(){o.renderAll(),o.fire(i),o.historyProcessing=!1,s&&"function"==typeof s&&s()})},fabric.Canvas.prototype.clearHistory=function(){this.historyUndo=[],this.historyRedo=[],this.fire("history:clear")},fabric.Canvas.prototype.onHistory=function(){this.historyProcessing=!1,this._historySaveAction()},fabric.Canvas.prototype.offHistory=function(){this.historyProcessing=!0};
import { BehaviorSubject, distinctUntilChanged, firstValueFrom, skip, Subscription } from "rxjs";
import FontManager from "./FontManager";
import ImageLayer from "./ImageLayer";
import {debounce} from "lodash";
import {
  CanvasFontStyles,
  DMSCanvasFile,
  IImageOptions,
  IPixelDimensions,
  SerializedCanvasBackground,
  SerializedImageLayerInfo,
  SerializedLayerInfo,
  SerializedSVGLayerInfo,
  SerializedTextLayerInfo,
} from "./Interfaces";
import Layer from "./Layer";
import LayerManager from "./LayerManager";
import TextLayer from "./TextLayer";
import ZoomAndPanManager from "./ZoomAndPanManager";
import FontFaceObserver from "fontfaceobserver";
import CropAndResizeManager from "./CropAndResizeManager";
import SVGLayer from "./SVGLayer";
import { Eraser } from "./Eraser";
import { HistoryManager } from "./HistoryManager";

const DEFAULT_ERASER_SIZE = 100;

// @ts-ignore 
// fabric.Canvas.prototype.initialize=function(t){return function(...i){return t.call(this,...i),this._historyInit(),this}}(fabric.Canvas.prototype.initialize),fabric.Canvas.prototype.dispose=function(t){return function(...i){return t.call(this,...i),this._historyDispose(),this}}(fabric.Canvas.prototype.dispose),fabric.Canvas.prototype._historyNext=function(){return JSON.stringify(this.toDatalessJSON(this.extraProps))},fabric.Canvas.prototype._historyEvents=function(){return{"object:added":this._historySaveAction,"object:removed":this._historySaveAction,"object:modified":this._historySaveAction,"object:skewing":this._historySaveAction}},fabric.Canvas.prototype._historyInit=function(){this.historyUndo=[],this.historyRedo=[],this.extraProps=["selectable","editable"],this.historyNextState=this._historyNext(),this.on(this._historyEvents())},fabric.Canvas.prototype._historyDispose=function(){this.off(this._historyEvents())},fabric.Canvas.prototype._historySaveAction=function(){if(this.historyProcessing)return;const t=this.historyNextState;this.historyUndo.push(t),this.historyNextState=this._historyNext(),this.fire("history:append",{json:t})},fabric.Canvas.prototype.undo=function(t){this.historyProcessing=!0;const i=this.historyUndo.pop();i?(this.historyRedo.push(this._historyNext()),this.historyNextState=i,this._loadHistory(i,"history:undo",t)):this.historyProcessing=!1},fabric.Canvas.prototype.redo=function(t){this.historyProcessing=!0;const i=this.historyRedo.pop();i?(this.historyUndo.push(this._historyNext()),this.historyNextState=i,this._loadHistory(i,"history:redo",t)):this.historyProcessing=!1},fabric.Canvas.prototype._loadHistory=function(t,i,s){var o=this;this.loadFromJSON(t,function(){o.renderAll(),o.fire(i),o.historyProcessing=!1,s&&"function"==typeof s&&s()})},fabric.Canvas.prototype.clearHistory=function(){this.historyUndo=[],this.historyRedo=[],this.fire("history:clear")},fabric.Canvas.prototype.onHistory=function(){this.historyProcessing=!1,this._historySaveAction()},fabric.Canvas.prototype.offHistory=function(){this.historyProcessing=!0};
export default class DMSCanvas {
  public id;
  public canvas!: fabric.Canvas;
  public layerManager!: LayerManager;
  public dimensions:IPixelDimensions;
  public originalSize: IPixelDimensions;
  public zoomAndPanManager!: ZoomAndPanManager;
  public fontManager!: FontManager;
  public cropAndResizeManager!: CropAndResizeManager;
  public backgroundColor!: string | fabric.Pattern | undefined;
  public backgroundImage!: string | fabric.Image | undefined;
  public _clipboard: fabric.Object;
  public shouldFireModifiedEvent: boolean = true;
  public eraser!:Eraser;
  public historyManager!:HistoryManager;

  constructor(
    id: string,
    dimensions: IPixelDimensions,
    originalSize: IPixelDimensions
  ) {
    this.id = id;
    this.dimensions = dimensions;
    this.originalSize = originalSize;
    this.init();
  }

  private debouncedOnChangeEventListener = debounce(function(event) {
    if(!this.shouldFireModifiedEvent) return;
    // window.setTimeout(() => {
      this.onChangeEmitter.next(this.save())
    // }, 50);
  },800,{leading:false,trailing:true});
  
  private init() {
    this.canvas = this.createCanvas(this.id, this.originalSize);
    this.fontManager = new FontManager();
    this.layerManager = new LayerManager(this.canvas, this.fontManager);
    this.zoomAndPanManager = new ZoomAndPanManager(this);
    this.cropAndResizeManager = new CropAndResizeManager(this);
    this.eraser = new Eraser(this);
    this.historyManager = new HistoryManager(this,this.onChangeEmitter.asObservable())
    this.eraser.brushSize = DEFAULT_ERASER_SIZE;
    this.canvas.on('object:modified', this.debouncedOnChangeEventListener.bind(this));
    this.canvas.on('object:added', this.debouncedOnChangeEventListener.bind(this));
    this.canvas.on('object:removed', this.debouncedOnChangeEventListener.bind(this));
    this.canvas.on('erasing:end', this.debouncedOnChangeEventListener.bind(this));
  }


  private createCanvas(id: string, dimensions: IPixelDimensions) {
    const canvasOptions: fabric.ICanvasOptions = {
      width: dimensions.width,
      height: dimensions.height,
      selection: false,
      backgroundColor: "white",
      selectionFullyContained: true,
      enableRetinaScaling: false,
    };
    const _canvas = new fabric.Canvas(id, canvasOptions);
    _canvas.preserveObjectStacking = true;
    this.backgroundColor = _canvas.backgroundColor;
    this.backgroundImage = _canvas.backgroundImage;
    _canvas.renderAll();

    return _canvas;
  }

  public add = (...fabricObjects: fabric.Object[]) => {
    this.canvas.add(...fabricObjects).requestRenderAll();

    this.zoomAndPanManager.update();
  };

  public drawRectangle = (options: fabric.IRectOptions) => {
    const rect = new fabric.Rect(options);
    this.add(rect);
    return rect;
  };

  public set selection(value: boolean) {
    this.canvas.selection = value;
  }

  public get selection() {
    return this.canvas.selection || false;
  }

  public set penMode(value: boolean) {
    this.canvas.isDrawingMode = value;
  }

  public get penMode() {
    return this.canvas.isDrawingMode || false;
  }

  public set penColor(value: string) {
    this.canvas.freeDrawingBrush.color = value;
  }

  public addImageFromUrl = (options: IImageOptions) => {
    return new Promise<fabric.Object>((res, rej) => {
      fabric.util.loadImage(
        options.imageUrl,
        (image) => {
          const _image = new fabric.Image(image);
          if (options.dimensions) {
            if(image.height > image.width) _image.scaleToHeight(options.dimensions.height);
            else _image.scaleToWidth(options.dimensions.width);
          }
          if (options.position) {
            _image.left = options.position.x;
            _image.top = options.position.y;
          }
          this.add(_image);
          this.canvas.renderAll();
          if (!options.position) {
            _image.center();
            _image.setCoords();
            _image.fire("moving", { transform: { target: _image } });
          }
          this.eraser.off();
          this.canvas?.renderAll();
          this.canvas.setActiveObject(_image);
          res(_image);
        },
        null,
        "anonymous",
      );
    });
  };


  public addText = async (text: string, fontStyle: CanvasFontStyles) => {
    if (fontStyle.fontFamily) {
      await this.fontManager.loadFont(fontStyle.fontFamily, fontStyle).catch(console.error);
    }

    const textbox = new fabric.Textbox(text);
    // Create a temporary Text object to measure the width
    const tempText = new fabric.Text(text, {
      fontSize: fontStyle.fontSize || 116,
      fontFamily: fontStyle.fontFamily || 'Arial',
      charSpacing: fontStyle.letterSpacing || 0
    });
  
    // Calculate the adjusted width
    const adjustedWidth = tempText.width + (5 * (tempText.fontSize / 116));
  
    // Set the width of the Textbox
    textbox.set({ width: adjustedWidth });
  
    textbox.fontSize = fontStyle.fontSize ? fontStyle.fontSize : 116;
    if(fontStyle.lineHeight) textbox.lineHeight = fontStyle.lineHeight;
    if(fontStyle.letterSpacing) textbox.charSpacing = fontStyle.letterSpacing;
    if(fontStyle.italic) textbox.set("fontStyle", "italic");
    if(fontStyle.underline) textbox.set("underline", true);
    if(fontStyle.textColor) textbox.set("fill", fontStyle.textColor);
    if(fontStyle.fontFamily) textbox.fontFamily = fontStyle.fontFamily;
    this.add(textbox);
    this.eraser.off();
    this.canvas.renderAll();
    this.canvas.setActiveObject(textbox);
    this.canvas.renderAll();
  };

  public undo = () => {
    // this.layerManager._layers.next([]);
    this.historyManager.undo();
    // (this.canvas as any).undo();
  };

  public redo = () => {
    // this.layerManager._layers.next([]);
    this.historyManager.redo();
    // (this.canvas as any).redo();
  };

  public resize = async (dimensions: IPixelDimensions) => {
    const layers = this.layerManager._layers.getValue();
    const yScale = dimensions.height / this.canvas.getHeight();
    const xScale = dimensions.width / this.canvas.getWidth();
    layers.forEach((layer) => {
      let height = layer._dimensions.getValue()?.height;
      let width = layer._dimensions.getValue()?.width;
      let xPosition = layer._position.getValue()?.x;
      let yPosition = layer._position.getValue()?.y;
      height = (height || this.originalSize.height) * yScale;
      width = (width || this.originalSize.width) * xScale;
      xPosition = (xPosition || 0) * xScale;
      yPosition = (yPosition || 0) * yScale;
      if (layer.type == "text") {
        (layer as TextLayer).fontSize =
          ((layer as TextLayer).fontSize || 0) * yScale;
      }
      layer.setDimensions({ height, width });
      layer.setPosition({ x: xPosition, y: yPosition });
    });
    try {
      this.canvas.renderAll();
    }
    catch(e) {
      console.error(e)
    }
    this.originalSize = dimensions;
    if(this.canvas) this.canvas?.setHeight(dimensions.height);
    if(this.canvas) this.canvas?.setWidth(dimensions.width);
    if (this.canvas.backgroundImage) {
      //@ts-ignore
      await this.setBackgroundFromURL(this.canvas.backgroundImage.getSrc())
    }
    try{
      this.canvas?.renderAll?.();
    }
    catch(e) {
      console.error(e)
    }
    this.zoomAndPanManager.update();
  };

  public resizeViewport = (dimensions: IPixelDimensions) => {
    this.dimensions = dimensions;
    this.zoomAndPanManager.resize();
    this.zoomAndPanManager.update();
    try {
      this.canvas?.renderAll();
    }
    catch(e) {
      console.error(e)
    }
  };

  public save = async () => {

    const layers = this?.layerManager?._layers?.getValue();
    const savedLayers: (
      | SerializedLayerInfo
      | SerializedImageLayerInfo
      | SerializedTextLayerInfo
    )[] = [];
    for (let i = layers.length - 1; i >= 0; i--) {
      let layer:
        | SerializedLayerInfo
        | SerializedImageLayerInfo
        | SerializedTextLayerInfo
        | SerializedSVGLayerInfo = {
        dimensions: layers[i]._dimensions.getValue() || { width: 0, height: 0 },
        flipX: (await firstValueFrom(layers[i].flipX)) || false,
        flipY: (await firstValueFrom(layers[i].flipY)) || false,
        id: layers[i].id,
        type: layers[i].type,
        rotation: (await firstValueFrom(layers[i].rotation)) || 0,
        position: layers[i]._position.getValue() || { x: 0, y: 0 },
        opacity: (await firstValueFrom(layers[i].opacity) !== undefined)?await firstValueFrom(layers[i].opacity):1,
        aspectRatioLock: (await firstValueFrom(layers[i].aspectRatioLock)) || false,
        tags: layers[i].getTags() || [],
        shadow: layers[i].getShadow() || undefined,
        //@ts-ignore
        eraser: layers[i].fabricRef?.eraser?.toJSON?.(),
      };
      if (layer.type == "image") {
        const imageLayer: ImageLayer = layers[i] as ImageLayer;
        layer = {
          ...layer,
          brightness: await firstValueFrom(imageLayer.brightnessValue),
          contrast: await firstValueFrom(imageLayer.contrastValue),
          hue: await firstValueFrom(imageLayer.hueValue),
          saturation: await firstValueFrom(imageLayer.saturationValue),
          hueShift: await Promise.all(imageLayer.hueShiftValues.map(x=>firstValueFrom(x))),
          src: imageLayer.imageFabricRef.getSrc(),
          originalSrc: imageLayer?.originalSrc,
        };
      }

      if (layer.type == "text") {
        const textLayer: TextLayer = layers[i] as TextLayer;
        layer = {
          ...layer,
          fontSize: textLayer.fontSize,
          letterSpacing: textLayer.letterSpacing,
          lineHeight: textLayer.lineHeight,
          textColor: textLayer.textColor,
          fontWeight: textLayer.fontWeight,
          underline: textLayer.underline,
          text: textLayer.textRef.get("text"),
          fontFamily: textLayer.fontFamily,
          textAlign: textLayer.textAlign,
        };
      }

      if (layer.type === "svg") {
        const svgLayer: SVGLayer = layers[i] as SVGLayer;
        layer = {
          ...layer,
          fill: svgLayer.fill.serialize(), // Serializing fill instance
          borderColor: svgLayer.borderColor,
          borderThickness: svgLayer.borderThickness,
          url: svgLayer.url
        };
      }


      savedLayers.push(layer);
    }

    let backgroundImage: fabric.Image;
    let backgroundInfo: SerializedCanvasBackground = {
      src: "",
      scaleX: 1,
      scaleY:1
    };
    if (this.canvas.backgroundImage) {
      backgroundImage = this.canvas.backgroundImage as fabric.Image;
      backgroundInfo = {
        src: backgroundImage.getSrc(),
        scaleX: backgroundImage.scaleX || 1,
        scaleY: backgroundImage.scaleY || 1,
      };
    }
    if(this.canvas.backgroundColor) {
      backgroundInfo.color = this.backgroundColor.toString();
    }

    const file: DMSCanvasFile = {
      layers: savedLayers,
      size: this.originalSize,
      backgroundInfo
    };
    return file;
  };

  public load = async (file: DMSCanvasFile) => {
    await this.layerManager.deleteAll();
    await this.resize(file.size);
    let backgroundPromise = new Promise<void>((res, rej) => res());
    if (file.backgroundInfo)
      backgroundPromise = this.setBackgroundFromURL(
        file.backgroundInfo?.src,
        file.backgroundInfo.scaleX,
        file.backgroundInfo.scaleY
      );
    else this.canvas.setBackgroundImage(null, () => {});
    for (let i = 0; i < file.layers.length; i++) {
      const layerData = file.layers[i];
      const layer = await this.addLayerFromSerializedData(layerData);
      await layer.setPropertiesFromSerializedData(layerData);
    }
    await backgroundPromise;
    if(file.backgroundInfo.color) {
      await this.setBackgroundColor(file.backgroundInfo.color);
    }
    this.canvas.requestRenderAll();
    this.canvas.renderAll();
    this.zoomAndPanManager.update();
  };

  public waitForLayer = () => {
    let sub: Subscription;
    return new Promise<Layer>((res) => {
      sub = this.layerManager.layers.subscribe((x) => {
        if (x.length >= 1) {
          res(x[0]);
          if (sub) sub.unsubscribe();
        }
      });
    });
  };

   /**
   * @description 
   * @param ref:fabric.Object
   * @returns
   */
  public getLayerByRef = async (ref:fabric.Object):Promise<Layer> => {
    let layer = this.layerManager._layers.value.find(x=>x.fabricRef === ref);
    if(layer) return layer;
    await new Promise(res=>setTimeout(res,200));
    return await this.getLayerByRef(ref);
  }

  /**
   * @description Please don't use this in parallel. Only one layer can be added at once. Wait for that layer to be added before adding a new layer, otherwise wrong reference can be returned. (You may receive any other layer than the one you have added)
   * @param layer
   * @returns
   */
  private addLayerFromSerializedData = async (
    layer: SerializedLayerInfo
  ): Promise<Layer> => {
    switch (layer.type) {
      case "text": {
        const textLayer = layer as SerializedTextLayerInfo;
        await this.addText(textLayer.text, {fontFamily:textLayer.fontFamily});
        break;
      }
      case "image": {
        const imageLayer = layer as SerializedImageLayerInfo;
        await this.addImageFromUrl({
          imageUrl: imageLayer.src,
        });
        break;
      }
      case "svg": {
        const svgLayer = layer as SerializedSVGLayerInfo;
        await this.addSVGFromURL(svgLayer.url);
        break;
      }
      default: {
        this.drawRectangle({
          left: 0,
          top: 0,
          fill: "red",
          width: 100,
          height: 200,
          selectable: true,
        });
      }
    }
    return await this.waitForLayer();
  };

  public setBackgroundColor = (color: string) => {
    return new Promise<void>((res)=>this.canvas.setBackgroundColor(color, () => {
      this.backgroundColor = color;
      this.canvas.requestRenderAll();
      try {
        this.canvas?.renderAll();
      }
      catch(e) {
        console.error(e)
      }
      res();
    }));
  }

  public toBase64Url() {
    this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    this.canvas.setZoom(1);
    const data = this.canvas.toDataURL();
    this.zoomAndPanManager.setZoom(this.zoomAndPanManager._zoom.getValue());
    return data;
  }

  public enableCopyPaste() {
    // let _clipboard: any;
    const canvas = this.canvas;
    document.addEventListener("keydown", (function (e) {
      if (e.ctrlKey && e.key === "c") {
        // Copy selected object
        canvas.getActiveObject()?.clone(function (cloned: any) {
          this._clipboard = cloned;
        });
      } else if (e.ctrlKey && e.key === "v") {
        // Paste copied object
        this._clipboard?.clone(function (clonedObj: any) {
          canvas.discardActiveObject();
          clonedObj.set({
            left: clonedObj.left + 10,
            top: clonedObj.top + 10,
            evented: true,
          });
          if (clonedObj.type === "activeSelection") {
            clonedObj.canvas = canvas;
            clonedObj.forEachObject(function (obj: any) {
              canvas.add(obj);
            });
            clonedObj.setCoords();
          } else {
            canvas.add(clonedObj);
          }
          this._clipboard.top += 10;
          this._clipboard.left += 10;
          canvas.setActiveObject(clonedObj);
          canvas.requestRenderAll();
        });
      }
    }).bind(this));
  }

  public copy() {
    this.canvas.getActiveObject()?.clone((function (cloned: any) {
      this._clipboard = cloned;
    }).bind(this));
  }

  public paste() {
    this._clipboard?.clone((function (clonedObj: any) {
      this.canvas.discardActiveObject();
      clonedObj.set({
        left: clonedObj.left + 10,
        top: clonedObj.top + 10,
        evented: true,
      });
      if (clonedObj.type === "activeSelection") {
        clonedObj.canvas = this.canvas;
        clonedObj.forEachObject(function (obj: any) {
          this.canvas.add(obj);
        });
        clonedObj.setCoords();
      } else {
        this.canvas.add(clonedObj);
      }
      this._clipboard.top += 10;
      this._clipboard.left += 10;
      this.canvas.setActiveObject(clonedObj);
      this.canvas.requestRenderAll();
    }).bind(this));
  }
  
  public setBackgroundFromURL = (
    url: string,
    scaleX?: number,
    scaleY?: number
  ) => {
    return new Promise<void>((res, rej) => {
      fabric.Image.fromURL(url, (image) => {
      const scaleX = this.canvas.width / image.width;
      const scaleY = this.canvas.height / image.height;
      const scale = Math.max(scaleX, scaleY);

      // Calculate position to center the image
      const imgWidth = image.width * scale;
      const imgHeight = image.height * scale;
      const left = (this.canvas.width - imgWidth) / 2;
      const top = (this.canvas.height - imgHeight) / 2;

      // Set the background image properties
      image.set({
        scaleX: scale,
        scaleY: scale,
        left: left,
        top: top,
        originX: 'left',
        originY: 'top',
        //@ts-ignore
        erasable:false
      });


        this.canvas.setBackgroundImage(
          image,
          () => {
            this.backgroundImage = url;
            this.canvas.renderAll();
            this.canvas?.fire("object:modified", { target: this.canvas });
            this.canvas.discardActiveObject();
            res();
          },
        );
      },{
        crossOrigin: "anonymous",
      });
    });
  };

  public loadImageWithHeaders(url,callback) {
    const headers = new Headers({
      'Origin': window.location.origin,
    });
    
      fetch(url, { headers: headers,mode:'cors' })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.blob();
        })
        .then((blob) => {
          const img = new Image();
          img.src = URL.createObjectURL(blob);
          img.onload = () => {
            const fabricImage = new fabric.Image(img);
            callback(fabricImage);
          };
          img.onerror = (error) => {
            console.error('There was a problem with the fetch operation:', error);
          };
        })
        .catch((error) => {
          console.error('There was a problem with the fetch operation:', error);
          
        });
    ;
  }
  
  public onChangeEmitter = new BehaviorSubject<Promise<DMSCanvasFile> | null>(null);
  public onChangeSubscriptions: Subscription = new Subscription();
  // This would fire whenever Canvas Changes, It accepts a callback which returns a promise of DMSCanvasFile. Also removes all previous subscriptions.
  public onChange = (callback: (file:Promise<DMSCanvasFile>) => void) => {
    this.onChangeSubscriptions.unsubscribe();
    this.onChangeSubscriptions = new Subscription();
    this.onChangeSubscriptions.add(this.onChangeEmitter.asObservable().pipe(skip(1)).subscribe((x) => {
      if(x) callback(x);
    }));
  }

  private loadSvgFromString(str:string) {
    return new Promise<fabric.Object[]>(res=>fabric.loadSVGFromString(str,res));
  }

  public async addSVGFromString(svgString) {
    let svg = await this.loadSvgFromString(svgString);
    let fabricObject: fabric.Object = fabric.util.groupSVGElements(svg);
    this.canvas.add(fabricObject);
    return fabricObject;
  }

  public async addSVGFromURL(svgURL) {
    let svg = await new Promise<fabric.Object[]>(res=>fabric.loadSVGFromURL(svgURL,res));
    let fabricObject: fabric.Object = fabric.util.groupSVGElements(svg);
    this.canvas.add(fabricObject);
    const layer = await this.getLayerByRef(fabricObject) as SVGLayer;
    layer.url  = svgURL;
    return fabricObject;
  }

  public async convertImageToSVG(imageLayerId: string, svgURL: string) {
    const layer = this.layerManager._layers.value.find(x=>x.id===imageLayerId);
    if(!layer || layer.type !== "image") throw new Error("Cannot find provided Image layer while converting to SVG.");
    const imageLayer = layer as ImageLayer;
    const fabricSVG = await this.addSVGFromURL(svgURL);
    const svgLayer = await this.getLayerByRef(fabricSVG) as SVGLayer;
    svgLayer.setFillFromImageLayer(imageLayer);
    svgLayer.fabricRef.set("dirty",true);
    svgLayer.fabricRef.scaleToHeight((this.originalSize.height / 2) * this.zoomAndPanManager._zoom.value);
    if(svgLayer._dimensions.value.height < svgLayer._dimensions.value.width) svgLayer.fabricRef.scaleToWidth((this.originalSize.width / 2) * this.zoomAndPanManager._zoom.value)
    svgLayer.align("centerX","centerY");
    svgLayer._dimensions.next({
      height: svgLayer.fabricRef.getScaledHeight(),
      width: svgLayer.fabricRef.getScaledWidth()
    })
    svgLayer.setTags(imageLayer.getTags?.()?.map(x=>x?.replace("image","[svg]")));
    this.layerManager.delete(imageLayer);
    this.canvas.setActiveObject(fabricSVG);
    this.canvas.renderAll();
    return svgLayer;
  }

  public async changeSVGUrl(svgLayerId:string, svgURL:string) {
    const oldSvgLayer = this.layerManager._layers.value.find(x=>x.id===svgLayerId) as SVGLayer;
    if(!oldSvgLayer || oldSvgLayer.type !== "svg") throw new Error("Cannot find provided SVG layer while Changing shape.");
    const fabricRef = await this.addSVGFromURL(svgURL);
    const newSvgLayer = await this.getLayerByRef(fabricRef) as SVGLayer;
    const serializedFill = oldSvgLayer.fill.serialize();
    newSvgLayer.setPosition(oldSvgLayer._position.value);
    newSvgLayer.borderColor = oldSvgLayer.borderColor;
    newSvgLayer.borderThickness = oldSvgLayer.borderThickness;
    const oldLayerHeight = oldSvgLayer._dimensions.value.height;
    const oldLayerWidth = oldSvgLayer._dimensions.value.width;
    let newLayerWidth = oldLayerWidth;
    let newLayerHeight = newSvgLayer._dimensions.value.height * (oldLayerWidth / newSvgLayer._dimensions.value.width); 
    if(newSvgLayer._dimensions.value.height > newSvgLayer._dimensions.value.width) {
        newLayerHeight = oldLayerHeight;
        newLayerWidth = newSvgLayer._dimensions.value.width * (oldLayerHeight / newSvgLayer._dimensions.value.height);
    }
    newSvgLayer.setDimensions({height: newLayerHeight, width:newLayerWidth});
    await newSvgLayer.fill.enliven(serializedFill);
    newSvgLayer.pattern = newSvgLayer.fill.redraw();
    newSvgLayer?.setTags(oldSvgLayer?.getTags?.());
    newSvgLayer.fabricRef.set("dirty",true);
    this.canvas.setActiveObject(fabricRef);
    this.canvas.renderAll();
    window.setTimeout(()=>{
      this.layerManager.delete(oldSvgLayer);
      this.canvas.renderAll();
    },10)
    return newSvgLayer;
  }

  public async extractImageFromSVGFill(svgLayerId:string) {
    const layer = this.layerManager._layers.value.find(x=>x.id===svgLayerId) as SVGLayer;
    if(!layer || layer.type !== "svg") throw new Error("Cannot find provided SVG layer while inserting image from SVG Fill.");
    const imageFabricRef = await this.addImageFromUrl({
      imageUrl: layer.fill.backgroundImageSrc,
      dimensions: layer._dimensions.value,
      position: layer._position.value
    });
    const imageLayer = await this.getLayerByRef(imageFabricRef);
    imageLayer.setTags(layer?.getTags?.().map(x=>x?.replace("[svg]","image")))
  }

}
