import { fabric } from "fabric";
import { nanoid } from "nanoid";
import { BehaviorSubject } from "rxjs";
import {
  AlignmentType,
  IPixelDimensions,
  IPosition,
  SerializedLayerInfo,
  IShadowOptions
} from "./Interfaces";
import LayerManager from "./LayerManager";

export default class Layer {
  fabricRef: fabric.Object;
  id: string;
  type = "generic";

  public _dimensions = new BehaviorSubject<IPixelDimensions | undefined>(
    undefined
  );
  public dimensions = this._dimensions.asObservable();

  public _position = new BehaviorSubject<IPosition | undefined>(undefined);
  public position = this._position.asObservable();

  private _opacity = new BehaviorSubject<number | undefined>(undefined);
  public opacity = this._opacity.asObservable();

  private _rotation = new BehaviorSubject<number | undefined>(undefined);
  public rotation = this._rotation.asObservable();

  private _flipX = new BehaviorSubject<boolean | undefined>(false);
  public flipX = this._flipX.asObservable();

  private _flipY = new BehaviorSubject<boolean | undefined>(false);
  public flipY = this._flipY.asObservable();

  private _aspectRatioLock = new BehaviorSubject<boolean | undefined>(false);
  public aspectRatioLock = this._aspectRatioLock.asObservable();
  
  public $tags = new BehaviorSubject<string[] | undefined>(undefined);
  public tags = this.$tags.asObservable();

  public $shadow = new BehaviorSubject<IShadowOptions | undefined>(undefined);
  public shadow = this.$shadow.asObservable();
  private layerManager!: LayerManager;
  constructor(obj: fabric.Object,_layerManager:LayerManager, name?: string, ) {
    this.fabricRef = obj;
    this.layerManager = _layerManager;
    this.fabricRef.set("lockScalingFlip", true);
    this.id = name || nanoid(9);
    this.addDimensionsListeners();
    this.addPositionListeners();
    this.addRotationListeners();
    try {
      this.fabricRef.canvas?.renderAll();
    }
    catch (e) {
      console.error(e);
    }
    this._dimensions.next({
      width: this.fabricRef.getScaledWidth(),
      height: this.fabricRef.getScaledHeight(),
    });
    this._rotation.next(this.fabricRef.get("angle"));
    this._position.next({
      x: this.fabricRef.left || 0,
      y: this.fabricRef.top || 0,
    });

    this._opacity.next(this.fabricRef.getObjectOpacity());
    this._flipX.next(this.fabricRef.get("flipX"));
    this._flipY.next(this.fabricRef.get("flipY"));
  }

  private addDimensionsListeners() {
    this.fabricRef.on("scaling", (x: any) => {
      this._dimensions.next({
        height: x.transform.target.getScaledHeight(),
        width: x.transform.target.getScaledWidth(),
      });
      this._position.next({
        x: x.transform.target.left,
        y: x.transform.target.top,
      });
    });
  }

  private addPositionListeners() {
    this.fabricRef.on("moving", (x: any) => {
      this._position.next({
        x: x.transform.target.left,
        y: x.transform.target.top,
      });
    });
  }

  private addRotationListeners() {
    this.fabricRef.on("rotating", (x: any) => {
      this._rotation.next(x.transform.target.angle);
      this._position.next({
        x: x.transform.target.left,
        y: x.transform.target.top,
      });
    });
  }

  public setPosition(position: IPosition) {
    this.fabricRef.top = position.y;
    this.fabricRef.left = position.x;
    try {
      this.fabricRef.canvas?.renderAll();
    }
    catch(e) {
      console.error(e);
    }
    this._position.next(position);
  }

  public setDimensions(dimensions: IPixelDimensions) {
    this.fabricRef.scaleY = dimensions.height / (this.fabricRef.height || 0);
    this.fabricRef.scaleX = dimensions.width / (this.fabricRef.width || 0);
    // this.fabricRef.scaleToWidth(dimensions.width);
    // this.fabricRef.wi
    try {
      this.fabricRef.canvas?.renderAll();
    }
    catch(e) {
      console.error(e);
    }
    const x = this.fabricRef.left || 0;
    const y = this.fabricRef.top || 0;
    this._dimensions.next(dimensions);
    this._position.next({ x, y });
  }

  setRotation(rotation: number) {
    this.fabricRef.rotate(rotation);
    try {
      this.fabricRef.canvas?.renderAll();
    }
    catch(e) {
      console.error(e);
    }
    this._rotation.next(rotation);
    this._position.next({
      x: this.fabricRef.left,
      y: this.fabricRef.top
    })
    this.fabricRef.canvas?.fire("object:modified", { target: this.fabricRef });
  }

  public setOpacity(opacity: number) {
    this.fabricRef.set("opacity", opacity);
    try {
      this.fabricRef.canvas?.renderAll();
    }
    catch(e) {
      console.error(e);
    }
    this._opacity.next(opacity);
    this.fabricRef.canvas?.fire("object:modified", { target: this.fabricRef });
  }

  public setFlipX(value: boolean) {
    this.fabricRef.set("flipX", value);
    try {
      this.fabricRef.canvas?.renderAll();
    }
    catch(e) {
      console.error(e);
    }
    this._flipX.next(value);
    this.fabricRef.canvas?.fire("object:modified", { target: this.fabricRef });
  }

  public setFlipY(value: boolean) {
    this.fabricRef.set("flipY", value);
    try {
      this.fabricRef.canvas?.renderAll();
    }
    catch(e) {
      console.error(e);
    }
    this._flipY.next(value);
    this.fabricRef.canvas?.fire("object:modified", { target: this.fabricRef });
  }

  public selectLayer() {
    this.fabricRef.canvas?.setActiveObject(this.fabricRef);
    try {
      this.fabricRef.canvas?.renderAll();
    }
    catch(e){
      console.error(e);
    }
  }

  public align(...alignmentTypes: AlignmentType[]) {
    alignmentTypes.forEach((alignment) => {
      const currentPosition = this.fabricRef.getPointByOrigin(
        "center",
        "center"
      );
      const bound = this.fabricRef.getBoundingRect();
      bound.height = bound.height / (this.fabricRef.canvas?.getZoom() || 1);
      bound.width = bound.width / (this.fabricRef.canvas?.getZoom() || 1);
      const canvasDimension: IPixelDimensions = {
        height: this.fabricRef.canvas?.height || 0,
        width: this.fabricRef.canvas?.width || 0,
      };

      switch (alignment) {
        case "top":
          currentPosition.y = bound.height / 2;
          break;
        case "centerY":
          currentPosition.y = canvasDimension.height / 2;
          break;
        case "bottom":
          currentPosition.y = canvasDimension.height - bound.height / 2;
          break;
        case "left":
          currentPosition.x = bound.width / 2;
          break;
        case "right":
          currentPosition.x = canvasDimension.width - bound.width / 2;
          break;
        case "centerX":
          currentPosition.x = canvasDimension.width / 2;
          break;
      }
      this.fabricRef.setPositionByOrigin(currentPosition, "center", "center");
      this.fabricRef.setCoords();
      try {
        this.fabricRef.canvas?.renderAll();
      }
      catch(e) {
        console.error(e);
      }
      this._position.next({
        x: this.fabricRef.get("left") || 0,
        y: this.fabricRef.get("top") || 0,
      });
    });
    this.fabricRef.canvas?.fire("object:modified", { target: this.fabricRef });
  }

  public setAspectRatioLock(value: boolean) {
    this._aspectRatioLock.next(value);
    this.fabricRef.lockUniScaling = value;
    if (value) {
      this.fabricRef.setControlVisible('mt', false);
      this.fabricRef.setControlVisible('mb', false);
      this.fabricRef.setControlVisible('ml', false);
      this.fabricRef.setControlVisible('mr', false);
    } else {
      // Show middle control points when aspect ratio is unlocked
      this.fabricRef.setControlVisible('mt', true);
      this.fabricRef.setControlVisible('mb', true);
      this.fabricRef.setControlVisible('ml', true);
      this.fabricRef.setControlVisible('mr', true);
    }
    this.fabricRef.canvas.renderAll();
    this.fabricRef.canvas?.fire("object:modified", { target: this.fabricRef });
  }

  public addTag(tag: string) {
    this.$tags.next([...(this.$tags?.value)?this.$tags?.value:[], tag]);
    this.fabricRef.canvas?.fire("object:modified", { target: this.fabricRef });
  }

  public removeTag(tag: string) {
    this.$tags.next(this.$tags?.value?.filter((t) => t !== tag));
  }

  public setTags(tags: string[]) {
    this.$tags.next(tags);
    this.layerManager._layers.next(this.layerManager._layers.value);
  }

  public getTags() {
    return this.$tags.value;
  }

  public setShadow(shadow: IShadowOptions | undefined) {
    if (!shadow) {
      this.$shadow.next(undefined);
      this.fabricRef.set("shadow", undefined);
      this.fabricRef.canvas.renderAll();
      return;
    }
    const _shadow = new fabric.Shadow();
    _shadow.color = shadow.color;
    _shadow.blur = shadow.blur;
    _shadow.offsetX = shadow.offsetX;
    _shadow.offsetY = shadow.offsetY;
    this.fabricRef.set("shadow", _shadow);
    this.$shadow.next(shadow);
    this.fabricRef.canvas?.fire("object:modified", { target: this.fabricRef });
    this.fabricRef.canvas.renderAll();
  }

  public getShadow() {
    return this.$shadow.getValue();
  }

  public async setPropertiesFromSerializedData(data: SerializedLayerInfo) {
    this.id = data.id;
    this.setDimensions(data.dimensions);
    this.setRotation(data.rotation);
    this.setPosition(data.position);
    this.setOpacity(data.opacity);
    this.setFlipX(data.flipX);
    this.setFlipY(data.flipY);
    this.setAspectRatioLock(data.aspectRatioLock);
    if(data.tags) this.setTags(data.tags); 
    if(data.shadow) this.setShadow(data.shadow);
    if(data.eraser) {
      //@ts-ignore
      this.fabricRef.eraser = await new Promise(res=>fabric.Eraser.fromObject(data.eraser,res));
      this.fabricRef.set("dirty",true);
    }
  }

  public async resetEraser() {

    // We need to use @ts-ignore because fabricjs doesn't have types for eraser.s it is not the part of Fabric js but part of the custom fabric js build we are using.

    //@ts-ignore`
     if(!this.fabricRef?.eraser?._objects ) return
     //@ts-ignore`
     this.fabricRef.eraser._objects = [];
     //@ts-ignore`
     this.fabricRef.eraser.set("dirty",true);
     this.fabricRef.set("dirty",true);
     this.fabricRef.canvas?.fire("object:modified", { target: this.fabricRef });
     this.fabricRef.canvas.renderAll();
  }

}
