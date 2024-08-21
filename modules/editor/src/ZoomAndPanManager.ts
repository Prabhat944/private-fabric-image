// eslint-disable-next-line import/no-unresolved
import { fabric } from "fabric";
import { BehaviorSubject } from "rxjs";
import DMSCanvas from "./DMSCanvas.js";
import { fabricEventHandler } from "./Interfaces.js";

export default class ZoomAndPanManager {
  dmsCanvas;
  private mouseDownHandler!: fabricEventHandler;
  private mouseUpHandler!: fabricEventHandler;
  private mouseWheelHandler!: fabricEventHandler;
  private mouseMoveHandler!: fabricEventHandler;
  public initialZoomSubject = new BehaviorSubject<number>(1);
  public initialZoom = this.initialZoomSubject.asObservable();
  public _zoom = new BehaviorSubject<number>(1);
  public zoom = this._zoom.asObservable();
  public $minFitZoom =  new BehaviorSubject<number>(1);
  public minFitZoom = this.$minFitZoom.asObservable();
  private zoomDisabled = false;

  constructor(canvas: DMSCanvas) {
    this.dmsCanvas = canvas;
    this.update();
  }

  private setUpListeners() {
    const canvas = this.dmsCanvas.canvas;
    const dimensions = this.dmsCanvas.dimensions;
    const zoomSubject = this._zoom;
    const maxFitZoom = Math.max(
      this.dmsCanvas.dimensions.width / this.dmsCanvas.originalSize.width,
      this.dmsCanvas.dimensions.height / this.dmsCanvas.originalSize.height
    );
    const isWidthLarger = this.dmsCanvas.originalSize.width > this.dmsCanvas.originalSize.height;
    const initialZoom = this.$minFitZoom.getValue();

    let isDragging = false;
    let currentX;
    let currentY;
    let initialX: number;
    let initialY: number;
    let xOffset = 0;
    let yOffset = 0;


    this.mouseWheelHandler = function (
      this: fabric.Canvas,
      opt: fabric.IEvent<WheelEvent>
    ) {
      const delta = opt.e.deltaY;
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 5) zoom = 5;
      if (zoom < 0.01) zoom = 0.01;
      canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
      const vpt = this.viewportTransform || [0, 0, 0, 0, 0, 0];
      // console.log(zoom, initialZoom, maxFitZoom, isWidthLarger);
      // console.log([...vpt])
      if (zoom < initialZoom) {
        vpt[4] = dimensions.width / 2 - (canvas.getWidth() * zoom) / 2;
        vpt[5] = dimensions.height / 2 - (canvas.getHeight() * zoom) / 2;
      }
      else if(zoom < maxFitZoom) {
        console.log('zoom < maxFitZoom a')
        if(isWidthLarger) {
          console.log('isWidthLarger a')
          // console.log(vpt[5], dimensions.height - canvas.getHeight() * zoom, [[dimensions.height, canvas.getHeight(), zoom]]);
          if (vpt[5] >= 0) {
            vpt[5] = dimensions.height / 2 - (canvas.getHeight() * zoom) / 2;
          } else if (vpt[5] < dimensions.height - canvas.getHeight() * zoom) {
            vpt[5] = dimensions.height - canvas.getHeight() * zoom;
          }
        }
        else {
          // // console.log('isHeightLarger')
          // console.log(vpt, dimensions.height - canvas.getHeight() * zoom, [[dimensions.height, canvas.getHeight(), zoom]]);
          if (vpt[4] >= 0) {
            vpt[4] = dimensions.width / 2 - (canvas.getWidth() * zoom) / 2;
          } else if (vpt[4] < dimensions.width - canvas.getWidth() * zoom) {
            vpt[4] = dimensions.width - canvas.getWidth() * zoom;
          }
          if (vpt[5] >= 0) {
            vpt[5] = dimensions.height / 2 - (canvas.getHeight() * zoom) / 2;
          } else if (vpt[5] < dimensions.height - canvas.getHeight() * zoom) {
            vpt[5] = dimensions.height - canvas.getHeight() * zoom;
          }
          // if (vpt[5] >= 0) {
          //   vpt[5] = 0;
          // } else if (vpt[5] < dimensions.height - canvas.getHeight() * zoom) {
          //   vpt[5] = dimensions.height - canvas.getHeight() * zoom;
          // }
        }
      }
      else {
        if (vpt[4] >= 0) {
          vpt[4] = 0;
        } else if (vpt[4] < dimensions.width - canvas.getWidth() * zoom) {
          vpt[4] = dimensions.width - canvas.getWidth() * zoom;
        }
        if (vpt[5] >= 0) {
          vpt[5] = 0;
        } else if (vpt[5] < dimensions.height - canvas.getHeight() * zoom) {
          vpt[5] = dimensions.height - canvas.getHeight() * zoom;
        }
      }

      zoomSubject.next(zoom);
    };

    this.mouseDownHandler = function (
      this: fabric.Canvas,
      opt: fabric.IEvent<MouseEvent>
    ) {
      // canvas.defaultCursor =
      //   'url("https://image.ibb.co/g94jNS/icon_grab.png") 8 2 ,auto';
      // drawingPointer.status = 'panning';/
      const evt = opt.e;
      evt.preventDefault();
      if (evt.altKey === true) {
        this.discardActiveObject();
        this.selection = false;
        isDragging = true;
        currentX = evt.clientX;
        currentY = evt.clientY;
        initialX = currentX;
        initialY = currentY;
      }
    };

    this.mouseMoveHandler = function (e) {
      if (isDragging && canvas.getZoom() > initialZoom) {
        const deltaX = e.e.clientX - initialX;
        const deltaY = e.e.clientY - initialY;
        
        const zoom = canvas.getZoom();

        let x = this.viewportTransform[4] + deltaX;
        let y = this.viewportTransform[5] + deltaY;

        // Get the bounds for the pan

        const maxPanX = dimensions.width - canvas.getWidth() * zoom;
        const maxPanY = dimensions.height - canvas.getHeight() * zoom;
        // console.log(zoom, maxPanX, maxPanY, [dimensions.width, canvas.getWidth(), zoom], [dimensions.height, canvas.getHeight(), zoom]);
        if (zoom <= maxFitZoom) {
            if (isWidthLarger) x = Math.min(Math.max(x, maxPanX), 0);
            else y = Math.min(Math.max(y, maxPanY), 0);
        } else if (zoom > maxFitZoom) { 
            x = Math.min(Math.max(x, maxPanX), 0);
            y = Math.min(Math.max(y, maxPanY), 0);
        }

        // Apply the calculated pan to the canvas
        this.viewportTransform[4] = x;
        this.viewportTransform[5] = y;
        
        initialX = e.e.clientX;
        initialY = e.e.clientY;

        // Request the canvas to render the new state
        canvas.requestRenderAll();
      }
    };

    this.mouseUpHandler = function (this: fabric.Canvas, e) {
      isDragging = false;
      this.selection = true;
    };
  }

  private addListeners() {
    this.dmsCanvas.canvas.on("mouse:wheel", this.mouseWheelHandler);
    this.dmsCanvas.canvas.on("mouse:down", this.mouseDownHandler);
    this.dmsCanvas.canvas.on("mouse:move", this.mouseMoveHandler);
    this.dmsCanvas.canvas.on("mouse:up", this.mouseUpHandler);
  }

  private removeListeners() {
    this.dmsCanvas.canvas.off("mouse:wheel", this.mouseWheelHandler);
    this.dmsCanvas.canvas.off("mouse:down", this.mouseDownHandler);
    this.dmsCanvas.canvas.off("mouse:move", this.mouseMoveHandler);
    this.dmsCanvas.canvas.off("mouse:up", this.mouseUpHandler);
  }

  public update() {
    const minFitZoom = Math.min(
      this.dmsCanvas.dimensions.width / this.dmsCanvas.originalSize.width,
      this.dmsCanvas.dimensions.height / this.dmsCanvas.originalSize.height
    );
    this.$minFitZoom.next(minFitZoom);
    const zoom = Math.min(
      (this.dmsCanvas.dimensions.width - (0.20 * this.dmsCanvas.dimensions.width)) / this.dmsCanvas.originalSize.width, 
      (this.dmsCanvas.dimensions.height - (0.20 * this.dmsCanvas.dimensions.height)) / this.dmsCanvas.originalSize.height
    )
    // console.log('update', zoom, this.dmsCanvas.originalSize.width, this.dmsCanvas.originalSize.height);
    // console.log('update', this.dmsCanvas.dimensions.width, this.dmsCanvas.dimensions.height);
    this.initialZoomSubject.next(zoom);
    this.setZoom(zoom);
    this.dmsCanvas.canvas.clipPath = new fabric.Rect({
      width: this.dmsCanvas.originalSize.width,
      height: this.dmsCanvas.originalSize.height,
      top: 0,
      left: 0,
      absolutePositioned: true,
    });

    // Set clipPath and viewportTransform to always center the content
    const vpt = this.dmsCanvas.canvas.viewportTransform || [0, 0, 0, 0, 0, 0];
    vpt[4] = this.dmsCanvas.dimensions.width / 2 - (this.dmsCanvas.canvas.getWidth() * zoom) / 2;
    vpt[5] = this.dmsCanvas.dimensions.height / 2 - (this.dmsCanvas.canvas.getHeight() * zoom) / 2;
    
    this.removeListeners();
    this.setUpListeners();
    if(!this.disabled) this.addListeners();
    try {
      this.dmsCanvas.canvas.renderAll();
    } catch (e) {
      console.error(e);
    }
    const canvasContainer =
      document.querySelector<HTMLElement>(".canvas-container");
    if (!canvasContainer) return;
    canvasContainer.style.width = this.dmsCanvas.dimensions.width + "px";
    canvasContainer.style.height = this.dmsCanvas.dimensions.height + "px";
    canvasContainer.style.overflow = "hidden";
    try { 
      this.dmsCanvas.canvas.renderAll();
    } catch (e) {
      console.error(e);
    }
  }

  public resize() {
    // this.dmsCanvas.canvas.clipPath = new fabric.Rect({
    //   width: this.dmsCanvas.originalSize.width,
    //   height: this.dmsCanvas.originalSize.height,
    //   top: 0,
    //   left: 0,
    //   absolutePositioned: true,
    // });
    this.removeListeners();
    
    
    const canvasContainer =
      document.querySelector<HTMLElement>(".canvas-container");
    if (!canvasContainer) return;
    canvasContainer.style.width = this.dmsCanvas.dimensions.width + "px";
    canvasContainer.style.height = this.dmsCanvas.dimensions.height + "px";
    canvasContainer.style.overflow = "hidden";
    try {
      this.dmsCanvas.canvas.renderAll();
    } catch (e) {
      console.error(e);
    }
    this.setUpListeners();
    this.addListeners();
    try {
      this.dmsCanvas.canvas.renderAll();
    } catch (e) {
      console.error(e);
    }
  }

  public setZoom(zoomValue: number) {
    let zoom = zoomValue;
    if (zoom > 5) zoom = 5;
    if (zoom < 0.01) zoom = 0.01;
  
    const opt = {
      x: this.dmsCanvas.dimensions.width / 2,
      y: this.dmsCanvas.dimensions.height / 2,
    };
  
    this.dmsCanvas.canvas.zoomToPoint(opt, zoom);
  
    const vpt = this.dmsCanvas.canvas.viewportTransform || [0, 0, 0, 0, 0, 0];
  
    const dimensions = this.dmsCanvas.dimensions;
    const canvas = this.dmsCanvas.canvas;
    const maxFitZoom = Math.max(
      this.dmsCanvas.dimensions.width / this.dmsCanvas.originalSize.width,
      this.dmsCanvas.dimensions.height / this.dmsCanvas.originalSize.height
    );
    const isWidthLarger = this.dmsCanvas.originalSize.width > this.dmsCanvas.originalSize.height;
  
    vpt[4] = dimensions.width / 2 - (canvas.getWidth() * zoom) / 2;
    vpt[5] = dimensions.height / 2 - (canvas.getHeight() * zoom) / 2;

    if (zoom <  this.$minFitZoom.getValue()) {
      vpt[4] = dimensions.width / 2 - (canvas.getWidth() * zoom) / 2;
      vpt[5] = dimensions.height / 2 - (canvas.getHeight() * zoom) / 2;
    } else if (zoom < maxFitZoom) {
        if(isWidthLarger) {
          if (vpt[5] >= 0) {
            vpt[5] = dimensions.height / 2 - (canvas.getHeight() * zoom) / 2;
          } else if (vpt[5] < dimensions.height - canvas.getHeight() * zoom) {
            vpt[5] = dimensions.height - canvas.getHeight() * zoom;
          }
        }
        else {
          if (vpt[4] >= 0) {
            vpt[4] = dimensions.width / 2 - (canvas.getWidth() * zoom) / 2;
          } else if (vpt[4] < dimensions.width - canvas.getWidth() * zoom) {
            vpt[4] = dimensions.width - canvas.getWidth() * zoom;
          }
          if (vpt[5] >= 0) {
            vpt[5] = dimensions.height / 2 - (canvas.getHeight() * zoom) / 2;
          } else if (vpt[5] < dimensions.height - canvas.getHeight() * zoom) {
            vpt[5] = dimensions.height - canvas.getHeight() * zoom;
          }
          // if (vpt[5] >= 0) {
          //   vpt[5] = 0;
          // } else if (vpt[5] < dimensions.height - canvas.getHeight() * zoom) {
          //   vpt[5] = dimensions.height - canvas.getHeight() * zoom;
          // }
        }
    } else {
      if (vpt[4] >= 0) {
        vpt[4] = 0;
      } else if (vpt[4] < dimensions.width - canvas.getWidth() * zoom) {
        vpt[4] = dimensions.width - canvas.getWidth() * zoom;
      }
      if (vpt[5] >= 0) {
        vpt[5] = 0;
      } else if (vpt[5] < dimensions.height - canvas.getHeight() * zoom) {
        vpt[5] = dimensions.height - canvas.getHeight() * zoom;
      }
    }
  
    this.dmsCanvas.canvas.setZoom(zoomValue);
    this._zoom.next(zoomValue);
  }
  
  public set disabled(boolean) {
    this.zoomDisabled = true;
    this.update();
  }

  public get disabled() {
    return this.zoomDisabled;
  }
}
