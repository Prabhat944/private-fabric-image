import { BehaviorSubject } from "rxjs";
import DMSCanvas from "./DMSCanvas.js";
export default class ZoomAndPanManager {
    dmsCanvas: any;
    private mouseDownHandler;
    private mouseUpHandler;
    private mouseWheelHandler;
    private mouseMoveHandler;
    initialZoomSubject: BehaviorSubject<number>;
    initialZoom: import("rxjs").Observable<number>;
    _zoom: BehaviorSubject<number>;
    zoom: import("rxjs").Observable<number>;
    constructor(canvas: DMSCanvas);
    private setUpListeners;
    private addListeners;
    private removeListeners;
    update(): void;
    setZoom(zoomValue: number): void;
}
