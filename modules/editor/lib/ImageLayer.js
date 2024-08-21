"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var FilterManager_1 = __importDefault(require("./FilterManager"));
var Layer_1 = __importDefault(require("./Layer"));
var ImageLayer = /** @class */ (function (_super) {
    __extends(ImageLayer, _super);
    function ImageLayer(obj, name) {
        var _this = _super.call(this, obj, name) || this;
        _this.imageFabricRef = _this.fabricRef;
        _this.filterManager = new FilterManager_1.default(_this.imageFabricRef);
        _this.brightnessFilter = _this.filterManager.add("brightness", 0);
        _this.brightnessValue = _this.brightnessFilter.observableValue;
        _this.contrastFilter = _this.filterManager.add("contrast", 0);
        _this.contrastValue = _this.contrastFilter.observableValue;
        _this.saturationFilter = _this.filterManager.add("saturation", 0);
        _this.saturationValue = _this.saturationFilter.observableValue;
        _this.hueFilter = _this.filterManager.add("hue", 0);
        _this.hueValue = _this.hueFilter.observableValue;
        return _this;
    }
    /**
     * @description Sets Brightness of Image layer
     * @author Prabhat Kumar
     * @date 2023-01-21
     * @param {number} value:number
     * @returns void
     */
    ImageLayer.prototype.setBrightness = function (value) {
        this.brightnessFilter.value = value;
    };
    /**
     * @description Sets Brightness of Image layer
     * @author Prabhat Kumar
     * @date 2023-01-21
     * @param {number} value:number
     * @returns void
     */
    ImageLayer.prototype.setContrast = function (value) {
        this.contrastFilter.value = value;
    };
    /**
     * @description Sets Brightness of Image layer
     * @author Prabhat Kumar
     * @date 2023-01-21
     * @param {number} value:number
     * @returns void
     */
    ImageLayer.prototype.setSaturation = function (value) {
        this.saturationFilter.value = value;
    };
    /**
     * @description Sets Brightness of Image layer
     * @author Prabhat Kumar
     * @date 2023-01-21
     * @param {number} value:number
     * @returns void
     */
    ImageLayer.prototype.setHue = function (value) {
        this.hueFilter.value = value;
    };
    ImageLayer.prototype.setPropertiesFromSerializedData = function (data) {
        _super.prototype.setPropertiesFromSerializedData.call(this, data);
        this.setBrightness(data.brightness);
        this.setContrast(data.contrast);
        this.setSaturation(data.saturation);
        this.setHue(data.hue);
    };
    return ImageLayer;
}(Layer_1.default));
exports.default = ImageLayer;
