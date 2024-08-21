import { Observable } from "rxjs";
import Filter from "./Filter";
import { SerializedImageLayerInfo } from "./Interfaces";
import Layer from "./Layer";
import { fabric } from 'fabric';
export default class ImageLayer extends Layer {
    imageFabricRef: fabric.Image;
    private filterManager;
    brightnessFilter: Filter;
    brightnessValue: Observable<number>;
    contrastFilter: Filter;
    contrastValue: Observable<number>;
    saturationFilter: Filter;
    saturationValue: Observable<number>;
    hueFilter: Filter;
    hueValue: Observable<number>;
    constructor(obj: fabric.Object, name?: string);
    /**
     * @description Sets Brightness of Image layer
     * @author Prabhat Kumar
     * @date 2023-01-21
     * @param {number} value:number
     * @returns void
     */
    setBrightness(value: number): void;
    /**
     * @description Sets Brightness of Image layer
     * @author Prabhat Kumar
     * @date 2023-01-21
     * @param {number} value:number
     * @returns void
     */
    setContrast(value: number): void;
    /**
     * @description Sets Brightness of Image layer
     * @author Prabhat Kumar
     * @date 2023-01-21
     * @param {number} value:number
     * @returns void
     */
    setSaturation(value: number): void;
    /**
     * @description Sets Brightness of Image layer
     * @author Prabhat Kumar
     * @date 2023-01-21
     * @param {number} value:number
     * @returns void
     */
    setHue(value: number): void;
    setPropertiesFromSerializedData(data: SerializedImageLayerInfo): void;
}
