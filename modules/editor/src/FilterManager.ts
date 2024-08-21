import Filter, { FilterOptions, HueShiftFilterValue } from "./Filter";
import { FilterType } from "./Interfaces";
import {fabric} from "fabric";
export default class FilterManager {
  filters: Filter[] = [];
  layerRef: fabric.Image;

  constructor(layerFabricRef: fabric.Image) {
    this.layerRef = layerFabricRef;
    const existingFilters: any[] = [...(this.layerRef.filters || [])];
    this.layerRef.filters = [];
    if(Array.isArray(existingFilters) && existingFilters.length > 0) this.layerRef.applyFilters();
    try {
      this.layerRef.canvas?.renderAll();
    }
    catch (e) {
      console.error(e);
    }
    for (const filter of existingFilters) {
      switch (filter.type) {
        case "Brightness":
          this.add("brightness", filter.brightness);
          break;
        case "Contrast":
          this.add("contrast", filter.contrast);
          break;
        case "Saturation":
          this.add("saturation", filter.saturation);
          break;
        case "HueRotation":
          this.add("hue", filter.rotation);
          break;
        case "HueShift":
          this.add("hueShift",{hueShift: filter.hueShift, brightnessShift: filter.brightnessShift, saturationShift: filter.saturationShift},{hueStart:filter?.hueStart || 0,hueEnd:filter?.hueEnd || 0})
          break;
      }
    }
  }

  add(filterType: FilterType, value: number | HueShiftFilterValue, options?: FilterOptions) {
    const _filter = new Filter(filterType, value, this.layerRef,options);
    this.filters.push(_filter);
    this.layerRef.filters?.push(_filter.filterRef);
    this.layerRef.applyFilters();
    try {
      this.layerRef.canvas?.renderAll();
    }
    catch(e) {
      console.error(e);
    }
    return _filter;
  }

  removeById(filterId: string) {
    const filter = this.filters.find((filter) => filter.id === filterId);
    if (!filter) return;
    this.layerRef.filters?.splice(
      this.layerRef.filters.indexOf(filter.filterRef),
      1
    );
    this.filters.splice(this.filters.indexOf(filter), 1);
    this.layerRef.canvas?.renderAll();
  }
}
