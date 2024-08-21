import { Observable } from "rxjs";
import Filter, { HueShiftFilterValue } from "./Filter";
import FilterManager from "./FilterManager";
import { SerializedImageLayerInfo } from "./Interfaces";
import Layer from "./Layer";
import {fabric} from 'fabric';
import LayerManager from "./LayerManager";

const HUE_RANGE = 45;
const HUE_OFFSET = 30;

export default class ImageLayer extends Layer {
  imageFabricRef: fabric.Image;
  private filterManager: FilterManager;

  /* Brightness */
  brightnessFilter: Filter;
  brightnessValue: Observable<number | HueShiftFilterValue> = new Observable<number>();

  /* Contrast */
  contrastFilter: Filter;
  contrastValue: Observable<number | HueShiftFilterValue> = new Observable<number>();

  /* Saturation */
  saturationFilter: Filter;
  saturationValue: Observable<number | HueShiftFilterValue> = new Observable<number>();

  /* Hue */
  hueFilter: Filter;
  hueValue: Observable<number | HueShiftFilterValue> = new Observable<number>();

  /* HueShiftFilters */
  hueShiftFilters:Filter[] = [];
  hueShiftValues: Observable<number | HueShiftFilterValue>[] = [];

  /* Blur */
  blurFilter: Filter;
  blurValue: Observable<number | HueShiftFilterValue> = new Observable<number>();

  /*Original Source*/
  originalSrc: string;

  constructor(obj: fabric.Object, layerManager:LayerManager, name?: string) {
    super(obj, layerManager, name);
    this.imageFabricRef = this.fabricRef as fabric.Image;
    this.filterManager = new FilterManager(this.imageFabricRef);
    this.hueFilter = this.filterManager.add("hue", 0);
    this.hueValue = this.hueFilter.observableValue;
    this.brightnessFilter = this.filterManager.add("brightness", 0);
    this.brightnessValue = this.brightnessFilter.observableValue;
    this.contrastFilter = this.filterManager.add("contrast", 0);
    this.contrastValue = this.contrastFilter.observableValue;
    this.saturationFilter = this.filterManager.add("saturation", 0);
    this.saturationValue = this.saturationFilter.observableValue;
    this.blurFilter = this.filterManager.add("blur",0);
    this.blurValue = this.blurFilter.observableValue;
    for (let index = 0; index < 360/HUE_RANGE; index++) {
      const filter = this.filterManager.add("hueShift",{
        hueShift: 0,
        brightnessShift: 0,
        saturationShift: 0,
      },{
        hueStart: (index * HUE_RANGE) - HUE_OFFSET,
        hueEnd: ((index + 1) * HUE_RANGE) - HUE_OFFSET,
      })
      this.hueShiftFilters.push(filter);
      this.hueShiftValues.push(filter.observableValue);
    }
    this.originalSrc = this.imageFabricRef.getSrc();
    this.type = "image";
  }

  /**
   * @description Sets Brightness of Image layer
   * @author Prabhat Kumar
   * @date 2023-01-21
   * @param {number} value:number
   * @returns void
   */
  setBrightness(value: number) {
    this.brightnessFilter.value = value;
    this.imageFabricRef.canvas?.fire("object:modified", { target: this.imageFabricRef });
  }

  /**
   * @description Sets Brightness of Image layer
   * @author Prabhat Kumar
   * @date 2023-01-21
   * @param {number} value:number
   * @returns void
   */
  setContrast(value: number) {
    this.imageFabricRef.canvas?.fire("object:modified", { target: this.imageFabricRef });
    this.contrastFilter.value = value;
  }

  /**
   * @description Sets Brightness of Image layer
   * @author Prabhat Kumar
   * @date 2023-01-21
   * @param {number} value:number
   * @returns void
   */
  setSaturation(value: number) {
    this.imageFabricRef.canvas?.fire("object:modified", { target: this.imageFabricRef });
    this.saturationFilter.value = value;
  }

  /**
   * @description Sets Brightness of Image layer
   * @author Prabhat Kumar
   * @date 2023-01-21
   * @param {number} value:number
   * @returns void
   */
  setHue(value: number) {
    this.imageFabricRef.canvas?.fire("object:modified", { target: this.imageFabricRef });
    this.hueFilter.value = value;
  }
/**
   * @description Sets blur of Image layer
   * @author Prabhat kumar
   * @date 2024-08-10
   * @param {number} value:number
   * @returns void
   */
  setBlur(value: number) {
    this.imageFabricRef.canvas?.fire("object:modified", { target: this.imageFabricRef });
    this.blurFilter.value = value;
  }

  setHueShift(index:number, value:HueShiftFilterValue) {
    this.imageFabricRef.canvas?.fire("object:modified", { target: this.imageFabricRef });
    this.hueShiftFilters[index].value = value;
  }

  public set src(url: string) {
    this.imageFabricRef.setSrc(url, () => {
      this.imageFabricRef.canvas?.renderAll();
      this.imageFabricRef.canvas?.fire("object:modified", { target: this.imageFabricRef });
    },{crossOrigin:'anonymous'});
  }

  public get src(): string {
    return this.imageFabricRef.getSrc();
  }


  public override async setPropertiesFromSerializedData(
    data: SerializedImageLayerInfo
  ) {
    super.setPropertiesFromSerializedData(data);
    this.setBrightness(data.brightness);
    this.setContrast(data.contrast);
    this.setSaturation(data.saturation);
    this.setHue(data.hue);
    this.setBlur(data?.blur || 0);
    data?.hueShift?.forEach((value,index)=>this.setHueShift(index,value));
    if(data.originalSrc) {
      this.originalSrc = data.originalSrc;
    }
  }
}
