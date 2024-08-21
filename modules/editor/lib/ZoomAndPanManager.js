"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line import/no-unresolved
var fabric_1 = require("fabric");
var rxjs_1 = require("rxjs");
var ZoomAndPanManager = /** @class */ (function () {
    function ZoomAndPanManager(canvas) {
        this.initialZoomSubject = new rxjs_1.BehaviorSubject(1);
        this.initialZoom = this.initialZoomSubject.asObservable();
        this._zoom = new rxjs_1.BehaviorSubject(1);
        this.zoom = this._zoom.asObservable();
        this.dmsCanvas = canvas;
        this.update();
    }
    ZoomAndPanManager.prototype.setUpListeners = function () {
        var canvas = this.dmsCanvas.canvas;
        var dimensions = this.dmsCanvas.dimensions;
        var zoomSubject = this._zoom;
        var initialZoom = this.initialZoomSubject.getValue();
        var isDragging = false;
        var currentX;
        var currentY;
        var initialX;
        var initialY;
        var xOffset = 0;
        var yOffset = 0;
        this.mouseWheelHandler = function (opt) {
            var delta = opt.e.deltaY;
            var zoom = canvas.getZoom();
            zoom *= Math.pow(0.999, delta);
            if (zoom > 20)
                zoom = 20;
            if (zoom < 0.01)
                zoom = 0.01;
            canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
            opt.e.preventDefault();
            opt.e.stopPropagation();
            var vpt = this.viewportTransform || [0, 0, 0, 0, 0, 0];
            if (zoom < initialZoom) {
                vpt[4] = dimensions.width / 2 - (canvas.getWidth() * zoom) / 2;
                vpt[5] = dimensions.height / 2 - (canvas.getHeight() * zoom) / 2;
            }
            else {
                if (vpt[4] >= 0) {
                    vpt[4] = 0;
                }
                else if (vpt[4] < dimensions.width - canvas.getWidth() * zoom) {
                    vpt[4] = dimensions.width - canvas.getWidth() * zoom;
                }
                if (vpt[5] >= 0) {
                    vpt[5] = 0;
                }
                else if (vpt[5] < dimensions.height - canvas.getHeight() * zoom) {
                    vpt[5] = dimensions.height - canvas.getHeight() * zoom;
                }
            }
            zoomSubject.next(zoom);
        };
        this.mouseDownHandler = function (opt) {
            // canvas.defaultCursor =
            //   'url("https://image.ibb.co/g94jNS/icon_grab.png") 8 2 ,auto';
            // drawingPointer.status = 'panning';/
            var evt = opt.e;
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
            var _a, _b;
            if (isDragging && canvas.getZoom() > initialZoom) {
                currentX = e.e.clientX;
                currentY = e.e.clientY;
                xOffset = currentX - initialX;
                yOffset = currentY - initialY;
                var point = new fabric_1.fabric.Point(((_a = canvas.viewportTransform) === null || _a === void 0 ? void 0 : _a[4]) || 0, ((_b = canvas.viewportTransform) === null || _b === void 0 ? void 0 : _b[5]) || 0);
                if (point.x + xOffset > 0) {
                    xOffset = -point.x;
                }
                if (point.x + xOffset <
                    dimensions.width - canvas.getWidth() * canvas.getZoom()) {
                    xOffset =
                        dimensions.width - canvas.getWidth() * canvas.getZoom() - point.x;
                }
                if (point.y + yOffset > 0) {
                    yOffset = -point.y;
                }
                if (point.y + yOffset <
                    dimensions.height - canvas.getHeight() * canvas.getZoom()) {
                    yOffset =
                        dimensions.height - canvas.getHeight() * canvas.getZoom() - point.y;
                }
                canvas.relativePan({ x: xOffset, y: yOffset });
                initialX = currentX;
                initialY = currentY;
            }
        };
        this.mouseUpHandler = function (e) {
            isDragging = false;
            this.selection = true;
        };
    };
    ZoomAndPanManager.prototype.addListeners = function () {
        this.dmsCanvas.canvas.on("mouse:wheel", this.mouseWheelHandler);
        this.dmsCanvas.canvas.on("mouse:down", this.mouseDownHandler);
        this.dmsCanvas.canvas.on("mouse:move", this.mouseMoveHandler);
        this.dmsCanvas.canvas.on("mouse:up", this.mouseUpHandler);
    };
    ZoomAndPanManager.prototype.removeListeners = function () {
        this.dmsCanvas.canvas.off("mouse:wheel", this.mouseWheelHandler);
        this.dmsCanvas.canvas.off("mouse:down", this.mouseDownHandler);
        this.dmsCanvas.canvas.off("mouse:move", this.mouseMoveHandler);
        this.dmsCanvas.canvas.off("mouse:up", this.mouseUpHandler);
    };
    ZoomAndPanManager.prototype.update = function () {
        var zoom = this.dmsCanvas.dimensions.width / this.dmsCanvas.originalSize.width;
        this.initialZoomSubject.next(zoom);
        this.setZoom(zoom);
        this.dmsCanvas.canvas.clipPath = new fabric_1.fabric.Rect({
            width: this.dmsCanvas.originalSize.width,
            height: this.dmsCanvas.originalSize.height,
            top: 0,
            left: 0,
            absolutePositioned: true,
        });
        this.removeListeners();
        this.setUpListeners();
        this.addListeners();
        this.dmsCanvas.canvas.renderAll();
        var canvasContainer = document.querySelector(".canvas-container");
        if (!canvasContainer)
            return;
        canvasContainer.style.width = this.dmsCanvas.dimensions.width + "px";
        canvasContainer.style.height = this.dmsCanvas.dimensions.height + "px";
        canvasContainer.style.overflow = "hidden";
    };
    ZoomAndPanManager.prototype.setZoom = function (zoomValue) {
        var zoom = zoomValue;
        if (zoom > 20)
            zoom = 20;
        if (zoom < 0.01)
            zoom = 0.01;
        this.dmsCanvas.canvas.zoomToPoint({
            x: this.dmsCanvas.dimensions.width / 2,
            y: this.dmsCanvas.dimensions.height / 2,
        }, zoom);
        var vpt = this.dmsCanvas.canvas.viewportTransform || [0, 0, 0, 0, 0, 0];
        if (zoom < this.initialZoomSubject.getValue()) {
            vpt[4] =
                this.dmsCanvas.dimensions.width / 2 -
                    (this.dmsCanvas.canvas.getWidth() * zoom) / 2;
            vpt[5] =
                this.dmsCanvas.dimensions.height / 2 -
                    (this.dmsCanvas.canvas.getHeight() * zoom) / 2;
        }
        else {
            if (vpt[4] >= 0) {
                vpt[4] = 0;
            }
            else if (vpt[4] <
                this.dmsCanvas.dimensions.width -
                    this.dmsCanvas.canvas.getWidth() * zoom) {
                vpt[4] =
                    this.dmsCanvas.dimensions.width -
                        this.dmsCanvas.canvas.getWidth() * zoom;
            }
            if (vpt[5] >= 0) {
                vpt[5] = 0;
            }
            else if (vpt[5] <
                this.dmsCanvas.dimensions.height -
                    this.dmsCanvas.canvas.getHeight() * zoom) {
                vpt[5] =
                    this.dmsCanvas.dimensions.height -
                        this.dmsCanvas.canvas.getHeight() * zoom;
            }
        }
        this.dmsCanvas.canvas.setZoom(zoomValue);
        this._zoom.next(zoomValue);
    };
    return ZoomAndPanManager;
}());
exports.default = ZoomAndPanManager;
