"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var ImageLayer_1 = __importDefault(require("./ImageLayer"));
var Layer_1 = __importDefault(require("./Layer"));
var TextLayer_1 = __importDefault(require("./TextLayer"));
var LayerManager = /** @class */ (function () {
    function LayerManager(_canvas, fontManager) {
        var _this = this;
        this._layers = new rxjs_1.BehaviorSubject([]);
        this.layers = this._layers.asObservable();
        this._selectedLayer = new rxjs_1.BehaviorSubject(undefined);
        this.selectedLayer = this._selectedLayer.asObservable();
        this.currentSelection = [];
        this.canvas = _canvas;
        this.canvas.on("object:added", function (x) {
            if (!x.target)
                return;
            var layers = _this._layers.getValue();
            var layer;
            var id = (x.target.type || "") +
                (layers.filter(function (y) { var _a; return y.fabricRef.type == ((_a = x.target) === null || _a === void 0 ? void 0 : _a.type); }).length + 1).toString();
            switch (x.target.type) {
                case "image":
                    layer = new ImageLayer_1.default(x.target, id);
                    break;
                case "textbox":
                    layer = new TextLayer_1.default(x.target, fontManager, id);
                    break;
                default:
                    layer = new Layer_1.default(x.target, id);
            }
            layers.unshift(layer);
            _this.setLayers(layers);
        });
        this.addSelectionEventListeners();
    }
    LayerManager.prototype.setLayers = function (layers) {
        this._layers.next(__spreadArray([], layers, true));
    };
    LayerManager.prototype.addSelectionEventListeners = function () {
        var _this = this;
        this.canvas.on("selection:updated", function (x) {
            var _a, _b, _c;
            if (!Array.isArray(x.selected) && !Array.isArray(x.deselected))
                return;
            var currentLayers = _this._layers.getValue();
            (_a = x.selected) === null || _a === void 0 ? void 0 : _a.forEach(function (layer) {
                var _layer = currentLayers.find(function (y) {
                    return y.fabricRef === layer;
                });
                if (_layer)
                    _this.currentSelection.push(_layer);
            });
            if (((_b = x.deselected) === null || _b === void 0 ? void 0 : _b.length) >= 1)
                _this.currentSelection = _this.currentSelection.filter(function (y) {
                    var flag = false;
                    for (var _i = 0, _a = x.deselected; _i < _a.length; _i++) {
                        var layer = _a[_i];
                        if (y.fabricRef !== layer)
                            flag = true;
                    }
                    return flag;
                });
            if (_this.currentSelection.length === 1)
                _this._selectedLayer.next((_c = _this.currentSelection) === null || _c === void 0 ? void 0 : _c[0]);
            else
                _this._selectedLayer.next(undefined);
        });
        this.canvas.on("selection:created", function (x) {
            var _a;
            _this.currentSelection = _this._layers.getValue().filter(function (currentLayer) {
                if (x.selected === undefined || !Array.isArray(x.selected))
                    return false;
                for (var _i = 0, _a = x.selected; _i < _a.length; _i++) {
                    var layer = _a[_i];
                    if (layer === currentLayer.fabricRef) {
                        return true;
                    }
                }
            });
            if (_this.currentSelection.length === 1)
                _this._selectedLayer.next((_a = _this.currentSelection) === null || _a === void 0 ? void 0 : _a[0]);
            else
                _this._selectedLayer.next(undefined);
        });
        this.canvas.on("selection:cleared", function () {
            _this._selectedLayer.next(undefined);
            _this.currentSelection = [];
        });
    };
    LayerManager.prototype.moveLayerToIndex = function (i, layer) {
        var _this = this;
        var _a, _b;
        (_a = layer.fabricRef.canvas) === null || _a === void 0 ? void 0 : _a.moveTo(layer.fabricRef, this._layers.getValue().length - i - 1);
        this.canvas.renderAll();
        var layers = [];
        (_b = layer.fabricRef.canvas) === null || _b === void 0 ? void 0 : _b.getObjects().forEach(function (object) {
            var layer = _this._layers.getValue().find(function (x) {
                return x.fabricRef === object;
            });
            if (layer)
                layers.unshift(layer);
        });
        this.setLayers(layers);
    };
    LayerManager.prototype.moveLayerUp = function (layer) {
        var index = this._layers.getValue().findIndex(function (x) { return x === layer; });
        this.moveLayerToIndex(index - 1, layer);
    };
    LayerManager.prototype.moveLayerDown = function (layer) {
        var index = this._layers.getValue().findIndex(function (x) { return x === layer; });
        this.moveLayerToIndex(index + 1, layer);
    };
    LayerManager.prototype.bringToFront = function (layer) {
        this.moveLayerToIndex(0, layer);
    };
    LayerManager.prototype.bringToBack = function (layer) {
        this.moveLayerToIndex(this._layers.getValue().length - 1, layer);
    };
    LayerManager.prototype.delete = function (layer) {
        var _a, _b;
        var layers = Array.from(this._layers.getValue());
        var index = layers.findIndex(function (x) { return x.id == layer.id; });
        (_a = layers[index].fabricRef.canvas) === null || _a === void 0 ? void 0 : _a.remove(layers[index].fabricRef);
        (_b = layers[index].fabricRef.canvas) === null || _b === void 0 ? void 0 : _b.renderAll();
        layers.splice(index, 1);
        this._layers.next(layers);
    };
    LayerManager.prototype.deleteAll = function () {
        var _this = this;
        this._layers.value.forEach(function (layer) { return _this.delete(layer); });
        return new Promise(function (res, rej) {
            _this.layers.subscribe(function (layers) {
                if (layers.length === 0)
                    res();
                window.setTimeout(function () { return rej(new Error("Layer Manager: Delete All TIMEOUT")); }, 100000);
            });
        });
    };
    return LayerManager;
}());
exports.default = LayerManager;
