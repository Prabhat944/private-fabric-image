import { fabric } from "fabric";
import { BehaviorSubject } from "rxjs";
import { FilterType } from "./Interfaces";
export default class Filter {
    filterRef: any;
    id: any;
    type: any;
    layer: any;
    _observableValue: BehaviorSubject<number>;
    observableValue: import("rxjs").Observable<number>;
    constructor(type: FilterType, value: number, layer: fabric.Image, id?: string);
    set value(v: number);
    get value(): number;
}
