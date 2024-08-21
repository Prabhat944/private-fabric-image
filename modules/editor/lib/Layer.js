"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var nanoid_1 = require("nanoid");
var rxjs_1 = require("rxjs");
var Layer = /** @class */ (function () {
    function Layer(obj, name) {
        var _a;
        this.type = "generic";
        this._dimensions = new rxjs_1.BehaviorSubject(undefined);
        this.dimensions = this._dimensions.asObservable();
        this._position = new rxjs_1.BehaviorSubject(undefined);
        this.position = this._position.asObservable();
        this._opacity = new rxjs_1.BehaviorSubject(undefined);
        this.opacity = this._opacity.asObservable();
        this._rotation = new rxjs_1.BehaviorSubject(undefined);
        this.rotation = this._rotation.asObservable();
        this._flipX = new rxjs_1.BehaviorSubject(false);
        this.flipX = this._flipX.asObservable();
        this._flipY = new rxjs_1.BehaviorSubject(false);
        this.flipY = this._flipY.asObservable();
        this.fabricRef = obj;
        this.fabricRef.set("lockScalingFlip", true);
        this.id = name || (0, nanoid_1.nanoid)(9);
        this.addDimensionsListeners();
        this.addPositionListeners();
        this.addRotationListeners();
        if (this.fabricRef.type === "image") {
            this.type = "image";
        }
        else if (this.fabricRef.type === "textbox") {
            this.type = "text";
        }
        (_a = this.fabricRef.canvas) === null || _a === void 0 ? void 0 : _a.renderAll();
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
    Layer.prototype.addDimensionsListeners = function () {
        var _this = this;
        this.fabricRef.on("scaling", function (x) {
            _this._dimensions.next({
                height: x.transform.target.getScaledHeight(),
                width: x.transform.target.getScaledWidth(),
            });
            _this._position.next({
                x: x.transform.target.left,
                y: x.transform.target.top,
            });
        });
    };
    Layer.prototype.addPositionListeners = function () {
        var _this = this;
        this.fabricRef.on("moving", function (x) {
            _this._position.next({
                x: x.transform.target.left,
                y: x.transform.target.top,
            });
        });
    };
    Layer.prototype.addRotationListeners = function () {
        var _this = this;
        this.fabricRef.on("rotating", function (x) {
            _this._rotation.next(x.transform.target.angle);
        });
    };
    Layer.prototype.setPosition = function (position) {
        var _a;
        this.fabricRef.top = position.y;
        this.fabricRef.left = position.x;
        (_a = this.fabricRef.canvas) === null || _a === void 0 ? void 0 : _a.renderAll();
        this._position.next(position);
    };
    Layer.prototype.setDimensions = function (dimensions) {
        var _a;
        this.fabricRef.scaleY = dimensions.height / (this.fabricRef.height || 0);
        this.fabricRef.scaleX = dimensions.width / (this.fabricRef.width || 0);
        // this.fabricRef.scaleToWidth(dimensions.width);
        // this.fabricRef.wi
        (_a = this.fabricRef.canvas) === null || _a === void 0 ? void 0 : _a.renderAll();
        var x = this.fabricRef.left || 0;
        var y = this.fabricRef.top || 0;
        this._dimensions.next(dimensions);
        this._position.next({ x: x, y: y });
    };
    Layer.prototype.setRotation = function (rotation) {
        // this.fabricRef.setAngle(rotation);
        var _a;
        this.fabricRef.rotate(rotation);
        (_a = this.fabricRef.canvas) === null || _a === void 0 ? void 0 : _a.renderAll();
        this._rotation.next(rotation);
    };
    Layer.prototype.setOpacity = function (opacity) {
        var _a;
        this.fabricRef.set("opacity", opacity);
        (_a = this.fabricRef.canvas) === null || _a === void 0 ? void 0 : _a.renderAll();
        this._opacity.next(opacity);
    };
    Layer.prototype.setFlipX = function (value) {
        var _a;
        this.fabricRef.set("flipX", value);
        (_a = this.fabricRef.canvas) === null || _a === void 0 ? void 0 : _a.renderAll();
        this._flipX.next(value);
    };
    Layer.prototype.setFlipY = function (value) {
        var _a;
        this.fabricRef.set("flipY", value);
        (_a = this.fabricRef.canvas) === null || _a === void 0 ? void 0 : _a.renderAll();
        this._flipY.next(value);
    };
    Layer.prototype.selectLayer = function () {
        var _a, _b;
        (_a = this.fabricRef.canvas) === null || _a === void 0 ? void 0 : _a.setActiveObject(this.fabricRef);
        (_b = this.fabricRef.canvas) === null || _b === void 0 ? void 0 : _b.renderAll();
    };
    // public get flipX() {
    //   return this.fabricRef.flipX;
    // }
    // public set flipX(value: boolean | undefined) {
    //   this.fabricRef.flipX = value;
    //   this.fabricRef.canvas?.renderAll();
    // }
    // public get flipY() {
    //   return this.fabricRef.flipY;
    // }
    // public set flipY(value: boolean | undefined) {
    //   this.fabricRef.flipY = value;
    //   this.fabricRef.canvas?.renderAll();
    // }
    Layer.prototype.align = function () {
        var _this = this;
        var alignmentTypes = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            alignmentTypes[_i] = arguments[_i];
        }
        alignmentTypes.forEach(function (alignment) {
            var _a, _b, _c, _d, _e;
            var currentPosition = _this.fabricRef.getPointByOrigin("center", "center");
            var bound = _this.fabricRef.getBoundingRect();
            bound.height = bound.height / (((_a = _this.fabricRef.canvas) === null || _a === void 0 ? void 0 : _a.getZoom()) || 1);
            bound.width = bound.width / (((_b = _this.fabricRef.canvas) === null || _b === void 0 ? void 0 : _b.getZoom()) || 1);
            var canvasDimension = {
                height: ((_c = _this.fabricRef.canvas) === null || _c === void 0 ? void 0 : _c.height) || 0,
                width: ((_d = _this.fabricRef.canvas) === null || _d === void 0 ? void 0 : _d.width) || 0,
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
            _this.fabricRef.setPositionByOrigin(currentPosition, "center", "center");
            _this.fabricRef.setCoords();
            (_e = _this.fabricRef.canvas) === null || _e === void 0 ? void 0 : _e.renderAll();
            _this._position.next({
                x: _this.fabricRef.get("left") || 0,
                y: _this.fabricRef.get("top") || 0,
            });
        });
    };
    Layer.prototype.setPropertiesFromSerializedData = function (data) {
        this.id = data.id;
        this.setDimensions(data.dimensions);
        this.setPosition(data.position);
        this.setOpacity(data.opacity);
        this.setRotation(data.rotation);
        this.setFlipX(data.flipX);
        this.setFlipY(data.flipY);
    };
    return Layer;
}());
exports.default = Layer;
