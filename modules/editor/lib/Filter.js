"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fabric_1 = require("fabric");
var nanoid_1 = require("nanoid");
var rxjs_1 = require("rxjs");
fabric_1.fabric.Image.filters.Brightness;
var Filter = /** @class */ (function () {
    function Filter(type, value, layer, id) {
        this._observableValue = new rxjs_1.BehaviorSubject(0);
        this.observableValue = this._observableValue.asObservable();
        switch (type) {
            case "brightness":
                this.filterRef = new fabric_1.fabric.Image.filters.Brightness({
                    brightness: value,
                });
                break;
            case "contrast":
                this.filterRef = new fabric_1.fabric.Image.filters.Contrast({
                    contrast: value,
                });
                break;
            case "saturation":
                this.filterRef = new fabric_1.fabric.Image.filters.Saturation({
                    saturation: value,
                });
                break;
            case "hue":
                this.filterRef = new fabric_1.fabric.Image.filters.HueRotation({
                    rotation: value,
                });
                break;
            default:
                throw new Error("Filter Type not found");
        }
        if (id)
            this.id = id;
        else
            this.id = (0, nanoid_1.nanoid)(9);
        this.layer = layer;
        this.value = value;
        // this._observableValue.next(value);
        this.type = type;
    }
    Object.defineProperty(Filter.prototype, "value", {
        get: function () {
            return this._observableValue.getValue();
            // return this.value;
        },
        set: function (v) {
            var _a;
            this.filterRef[this.type === "hue" ? "rotation" : this.type] = v;
            this.layer.applyFilters();
            (_a = this.layer.canvas) === null || _a === void 0 ? void 0 : _a.renderAll();
            this._observableValue.next(v);
        },
        enumerable: false,
        configurable: true
    });
    return Filter;
}());
exports.default = Filter;
