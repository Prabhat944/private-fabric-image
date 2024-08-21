import { fabric } from "fabric";
import { nanoid } from "nanoid";
import { BehaviorSubject } from "rxjs";
import { FilterType } from "./Interfaces";
import { HueShiftFilter } from "./HueShiftFilter";

export interface FilterOptions {
  id?: number,
  hueStart?: number,
  hueEnd?:number,
}

export interface HueShiftFilterValue {
  hueShift: number,
  brightnessShift: number,
  saturationShift: number;
}

export default class Filter {
  filterRef;
  id;
  type;
  layer;
  _observableValue = new BehaviorSubject<number | HueShiftFilterValue>(0);
  observableValue = this._observableValue.asObservable();

  constructor(
    type: FilterType,
    value: number | HueShiftFilterValue,
    layer: fabric.Image,
    options: FilterOptions = {}
  ) {
    switch (type) {
      case "brightness":
        this.filterRef = new fabric.Image.filters.Brightness({
          brightness: Number(value) || 0,
        });
        break;
      case "contrast":
        this.filterRef = new fabric.Image.filters.Contrast({
          contrast: Number(value) || 0,
        });
        break;
      case "saturation":
        this.filterRef = new fabric.Image.filters.Saturation({
          saturation: Number(value) || 0,
        });
        break;
      case "hue":
        this.filterRef = new (fabric.Image.filters as any).HueRotation({
          rotation: Number(value) || 0,
        });
        break;
      case "hueShift":
        this.filterRef = new HueShiftFilter({
          hueStart: options.hueStart || 0,
          hueEnd: options.hueEnd || 0,
          hueShift:(value as HueShiftFilterValue).hueShift || 0,
          saturationShift: (value as HueShiftFilterValue).saturationShift || 0,
          brightnessShift: (value as HueShiftFilterValue).brightnessShift || 0,
        });
        break;
      case "blur":
        this.filterRef = new (fabric.Image.filters).Blur({
          blur:value,
        })
        break;
      default:
        throw new Error("Filter Type not found");
    }
    if (options.id) this.id = options.id;
    else this.id = nanoid(9);
    this.layer = layer;
    this.value = value;
    this.type = type;
  }

  public set value(v: number | HueShiftFilterValue) {
    if(this.type === "hueShift") {
      if(typeof v === "number") this.filterRef.hueShift = v;
      else {
        this.filterRef.hueShift = v.hueShift;
        this.filterRef.brightnessShift = v.brightnessShift;
        this.filterRef.saturationShift = v.saturationShift;
      }
    }
    else (this.filterRef as any)[this.type === "hue" ? "rotation" : this.type] = v;
    this.layer.applyFilters();
    try {
      this.layer.canvas?.renderAll();
    }
    catch(err) {
      console.error(err);
    }
    this._observableValue.next(v);
  }

  public get value() {
    return this._observableValue.getValue();
  }
}
