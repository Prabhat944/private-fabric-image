import { fabric } from "fabric";
import { xor } from "lodash";
import { BehaviorSubject } from "rxjs";
import FontManager from "./FontManager";
import { IPixelDimensions, SerializedTextLayerInfo, TextAlignment } from "./Interfaces";
import Layer from "./Layer";
import FontFaceObserver from "fontfaceobserver";
import LayerManager from "./LayerManager";

export default class TextLayer extends Layer {
  public textRef: fabric.Textbox;
  private _editing = new BehaviorSubject<boolean>(false);
  public editing = this._editing.asObservable();
  private fontManager;

  constructor(obj: fabric.Object, fontManager: FontManager, layerManager:LayerManager, name?: string) {
    super(obj, layerManager,name);
    this.textRef = obj as fabric.Textbox;
    this.fontManager = fontManager;
    this.textRef.lockScalingY = true;
    this.type = "text";
    this.fabricRef.setControlVisible('bl', false);
    this.fabricRef.setControlVisible('tl', false);
    this.fabricRef.setControlVisible('br', false);
    this.fabricRef.setControlVisible('tr', false);
    this.fabricRef.setControlVisible('mt', false);
    this.fabricRef.setControlVisible('mb', false);
    this.fabricRef.center();
    this.fabricRef.setCoords();
    this.fabricRef.fire("moving", { transform: { target: this.fabricRef } });
    this.setListeners();
  }

  private setListeners() {
    this.textRef.on("editing:entered", (e) => {
      this._editing.next(true);
    });

    this.textRef.on("editing:exited", (e) => {
      this._editing.next(false);
    });

    this.textRef.on("event:changed", (e) => {
      this.textRef.getMinWidth();
      this.setDimensions({
        height:this.textRef.getScaledHeight(),
        width: this.textRef.getMinWidth()
      })
    });

    this.textRef.on("modified", (e) => {

    });

    this.textRef.on("resizing", (e: any) => {
      
      this._dimensions.next({
        height: e.transform.target.getScaledHeight(),
        width: e.transform.target.getScaledWidth(),
      });
    });
  }

  public get fontSize() {
    return this.textRef.fontSize;
  }

  public set fontSize(value) {
    this.textRef.fontSize = value;
    try {
    this.textRef.canvas?.renderAll();
    } catch (e) {
      console.error(e);
    }
    this._dimensions.next({
      height: this.textRef.getScaledHeight() || 0,
      width: this.textRef.getScaledWidth() || 0,
    });
    this.textRef.canvas?.fire("object:modified", { target: this.textRef });
    try {
      this.textRef.canvas?.renderAll();
    } catch (e) {
      console.error(e);
    }
  }

  public get textColor() {
    return this.textRef.get("fill");
  }

  public set textColor(value) {
    this.textRef.set("fill", value);
    this.textRef.canvas?.fire("object:modified", { target: this.textRef });
    try {
      this.textRef.canvas?.renderAll();
    } catch (e) {
      console.error(e);
    }
  }

  public override setDimensions(dimensions: IPixelDimensions): void {
    if (dimensions.width < this.textRef.getMinWidth()) {
      dimensions.width = this.textRef.getMinWidth();
    }
    dimensions.height = this.textRef.getScaledHeight();
    this.textRef.width = dimensions.width;
    try {
      this.textRef.canvas?.renderAll();
    } catch (e) {
      console.error(e);
    }
    const x = this.fabricRef.left || 0;
    const y = this.fabricRef.top || 0;
    this._dimensions.next(dimensions);
    this._position.next({ x, y });
  }

  public get fontWeight() {
    return this.textRef.fontWeight;
  }

  public set fontWeight(value) {
    this.textRef.canvas?.fire("object:modified", { target: this.textRef });
    this.textRef.fontWeight = value;
    document.fonts.load(`${value} ${this.fontSize}px ` + this.fontFamily).then(() => {
        this.fabricRef.canvas?.renderAll();
    }).catch((e) => {
      console.error(e);
    });
  }

  public get underline() {
    return this.textRef.get("underline");
  }

  public set underline(value) {
    this.textRef.canvas?.fire("object:modified", { target: this.textRef });
    this.textRef.set("underline", value);
    try { 
      this.fabricRef.canvas?.renderAll();
    } catch (e) {
      console.error(e);
    }
  }

  public get italic() {
    return this.textRef.get("fontStyle") === "italic";
  }

  public set italic(value) {
    this.textRef.canvas?.fire("object:modified", { target: this.textRef });
    this.textRef.set("fontStyle", value ? "italic" : "");
    document.fonts.load(`${value?"italic":""} 16px ` + this.fontFamily).then(() => {
      this.fabricRef.canvas?.renderAll();
    }).catch((e) => {
      console.error(e);
    });
  }

  public get letterSpacing() {
    return this.textRef.get("charSpacing");
  }

  public set letterSpacing(value) {
    this.textRef.canvas?.fire("object:modified", { target: this.textRef });
    this.textRef.set("charSpacing", value);
    try {
      this.fabricRef.canvas?.renderAll();
    } catch (e) {
      console.error(e);
    }
  }

  public get lineHeight() {
    return this.textRef.get("lineHeight");
  }

  public set lineHeight(value) {
    this.textRef.canvas?.fire("object:modified", { target: this.textRef });
    this.textRef.set("lineHeight", value);
    try {
      this.fabricRef.canvas?.renderAll();
    } catch (e) {
      console.error(e);
    }
  }

  public get fontFamily() {
    return this.textRef.get("fontFamily");
  }

  public set fontFamily(value) {

    const setAsync = async () => {
      this.textRef.canvas?.fire("object:modified", { target: this.textRef });
      await this.fontManager.loadFont(value || "Roboto");
      const fontObserver = new FontFaceObserver(value,{weight: this.fontWeight, style: this.italic ? "italic" : ""});
      await fontObserver.load();
      this.textRef.set("fontFamily", value);
      this.textRef.canvas?.renderAll();
    }

    setAsync().catch(console.error);
  }

  public set textAlign(value:TextAlignment) {
    this.textRef.canvas?.fire("object:modified", { target: this.textRef });
    this.textRef.set("textAlign", value);
    try { 
      this.fabricRef.canvas?.renderAll();
    } catch (e) {
      console.error(e);
    }
  }

  public get textAlign() {
    return this.textRef.get("textAlign") as TextAlignment;
  }

  public override async setPropertiesFromSerializedData(
    data: SerializedTextLayerInfo
  ) {
    super.setPropertiesFromSerializedData(data);
    this.fontSize = data.fontSize;
    this.textColor = data.textColor;
    this.fontWeight = data.fontWeight;
    this.underline = data.underline;
    this.italic = data.italic;
    this.letterSpacing = data.letterSpacing;
    this.lineHeight = data.lineHeight;
    this.textAlign = data.textAlign;
  }
}
