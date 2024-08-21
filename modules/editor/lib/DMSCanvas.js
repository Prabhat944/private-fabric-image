"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fabric_1 = require("fabric");
// import "fabric-history";
// fabric.Canvas.prototype.initialize=function(t){return function(...i){return t.call(this,...i),this._historyInit(),this}}(fabric.Canvas.prototype.initialize),fabric.Canvas.prototype.dispose=function(t){return function(...i){return t.call(this,...i),this._historyDispose(),this}}(fabric.Canvas.prototype.dispose),fabric.Canvas.prototype._historyNext=function(){return JSON.stringify(this.toDatalessJSON(this.extraProps))},fabric.Canvas.prototype._historyEvents=function(){return{"object:added":this._historySaveAction,"object:removed":this._historySaveAction,"object:modified":this._historySaveAction,"object:skewing":this._historySaveAction}},fabric.Canvas.prototype._historyInit=function(){this.historyUndo=[],this.historyRedo=[],this.extraProps=["selectable","editable"],this.historyNextState=this._historyNext(),this.on(this._historyEvents())},fabric.Canvas.prototype._historyDispose=function(){this.off(this._historyEvents())},fabric.Canvas.prototype._historySaveAction=function(){if(this.historyProcessing)return;const t=this.historyNextState;this.historyUndo.push(t),this.historyNextState=this._historyNext(),this.fire("history:append",{json:t})},fabric.Canvas.prototype.undo=function(t){this.historyProcessing=!0;const i=this.historyUndo.pop();i?(this.historyRedo.push(this._historyNext()),this.historyNextState=i,this._loadHistory(i,"history:undo",t)):this.historyProcessing=!1},fabric.Canvas.prototype.redo=function(t){this.historyProcessing=!0;const i=this.historyRedo.pop();i?(this.historyUndo.push(this._historyNext()),this.historyNextState=i,this._loadHistory(i,"history:redo",t)):this.historyProcessing=!1},fabric.Canvas.prototype._loadHistory=function(t,i,s){var o=this;this.loadFromJSON(t,function(){o.renderAll(),o.fire(i),o.historyProcessing=!1,s&&"function"==typeof s&&s()})},fabric.Canvas.prototype.clearHistory=function(){this.historyUndo=[],this.historyRedo=[],this.fire("history:clear")},fabric.Canvas.prototype.onHistory=function(){this.historyProcessing=!1,this._historySaveAction()},fabric.Canvas.prototype.offHistory=function(){this.historyProcessing=!0};
var rxjs_1 = require("rxjs");
var FontManager_1 = __importDefault(require("./FontManager"));
var LayerManager_1 = __importDefault(require("./LayerManager"));
var ZoomAndPanManager_1 = __importDefault(require("./ZoomAndPanManager"));
// fabric.Canvas.prototype.initialize=function(t){return function(...i){return t.call(this,...i),this._historyInit(),this}}(fabric.Canvas.prototype.initialize),fabric.Canvas.prototype.dispose=function(t){return function(...i){return t.call(this,...i),this._historyDispose(),this}}(fabric.Canvas.prototype.dispose),fabric.Canvas.prototype._historyNext=function(){return JSON.stringify(this.toDatalessJSON(this.extraProps))},fabric.Canvas.prototype._historyEvents=function(){return{"object:added":this._historySaveAction,"object:removed":this._historySaveAction,"object:modified":this._historySaveAction,"object:skewing":this._historySaveAction}},fabric.Canvas.prototype._historyInit=function(){this.historyUndo=[],this.historyRedo=[],this.extraProps=["selectable","editable"],this.historyNextState=this._historyNext(),this.on(this._historyEvents())},fabric.Canvas.prototype._historyDispose=function(){this.off(this._historyEvents())},fabric.Canvas.prototype._historySaveAction=function(){if(this.historyProcessing)return;const t=this.historyNextState;this.historyUndo.push(t),this.historyNextState=this._historyNext(),this.fire("history:append",{json:t})},fabric.Canvas.prototype.undo=function(t){this.historyProcessing=!0;const i=this.historyUndo.pop();i?(this.historyRedo.push(this._historyNext()),this.historyNextState=i,this._loadHistory(i,"history:undo",t)):this.historyProcessing=!1},fabric.Canvas.prototype.redo=function(t){this.historyProcessing=!0;const i=this.historyRedo.pop();i?(this.historyUndo.push(this._historyNext()),this.historyNextState=i,this._loadHistory(i,"history:redo",t)):this.historyProcessing=!1},fabric.Canvas.prototype._loadHistory=function(t,i,s){var o=this;this.loadFromJSON(t,function(){o.renderAll(),o.fire(i),o.historyProcessing=!1,s&&"function"==typeof s&&s()})},fabric.Canvas.prototype.clearHistory=function(){this.historyUndo=[],this.historyRedo=[],this.fire("history:clear")},fabric.Canvas.prototype.onHistory=function(){this.historyProcessing=!1,this._historySaveAction()},fabric.Canvas.prototype.offHistory=function(){this.historyProcessing=!0};
var DMSCanvas = /** @class */ (function () {
    function DMSCanvas(id, dimensions, originalSize) {
        var _this = this;
        this.add = function () {
            var _a;
            var fabricObjects = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                fabricObjects[_i] = arguments[_i];
            }
            (_a = _this.canvas).add.apply(_a, fabricObjects).requestRenderAll();
            _this.zoomAndPanManager.update();
        };
        this.drawRectangle = function (options) {
            var rect = new fabric_1.fabric.Rect(options);
            _this.add(rect);
        };
        this.addImageFromUrl = function (options) {
            return new Promise(function (res, rej) {
                fabric_1.fabric.util.loadImage(options.imageUrl, function (image) {
                    var _image = new fabric_1.fabric.Image(image);
                    if (options.dimensions) {
                        // _image.height = options.dimensions.height;
                        _image.scaleToHeight(options.dimensions.height);
                        _image.scaleToWidth(options.dimensions.width);
                        // _image.width = options.dimensions.width;
                    }
                    if (options.position) {
                        _image.left = options.position.x;
                        _image.top = options.position.y;
                    }
                    _this.add(_image);
                    _this.canvas.renderAll();
                    if (!options.position) {
                        _image.center();
                        _image.setCoords();
                        _image.fire("moving", { transform: { target: _image } });
                    }
                    _this.canvas.renderAll();
                    _this.zoomAndPanManager.update();
                    res();
                }, null);
            });
        };
        this.addText = function (text, fontStyle) { return __awaiter(_this, void 0, void 0, function () {
            var textbox;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        textbox = new fabric_1.fabric.Textbox(text);
                        textbox.fontSize = (fontStyle.fontSize) ? fontStyle.fontSize : 116;
                        if (fontStyle.lineHeight)
                            textbox.lineHeight = fontStyle.lineHeight;
                        if (fontStyle.letterSpacing)
                            textbox.charSpacing = fontStyle.letterSpacing;
                        if (fontStyle.italic)
                            textbox.set("fontStyle", "italic");
                        if (fontStyle.underline)
                            textbox.set("underline", true);
                        if (fontStyle.textColor)
                            textbox.set("fill", fontStyle.textColor);
                        if (!fontStyle.fontFamily) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.fontManager.loadFont(fontStyle.fontFamily)];
                    case 1:
                        _b.sent();
                        textbox.fontFamily = fontStyle.fontFamily;
                        _b.label = 2;
                    case 2:
                        this.add(textbox);
                        (_a = textbox.canvas) === null || _a === void 0 ? void 0 : _a.requestRenderAll();
                        textbox.initDimensions();
                        return [2 /*return*/];
                }
            });
        }); };
        this.undo = function () {
            _this.layerManager._layers.next([]);
            _this.canvas.undo();
        };
        this.redo = function () {
            _this.layerManager._layers.next([]);
            _this.canvas.redo();
        };
        this.resize = function (dimensions) {
            var layers = _this.layerManager._layers.getValue();
            var yScale = dimensions.height / _this.canvas.getHeight();
            var xScale = dimensions.width / _this.canvas.getWidth();
            layers.forEach(function (layer) {
                var _a, _b, _c, _d;
                var height = (_a = layer._dimensions.getValue()) === null || _a === void 0 ? void 0 : _a.height;
                var width = (_b = layer._dimensions.getValue()) === null || _b === void 0 ? void 0 : _b.width;
                var xPosition = (_c = layer._position.getValue()) === null || _c === void 0 ? void 0 : _c.x;
                var yPosition = (_d = layer._position.getValue()) === null || _d === void 0 ? void 0 : _d.y;
                height = (height || _this.originalSize.height) * yScale;
                width = (width || _this.originalSize.width) * xScale;
                xPosition = (xPosition || 0) * xScale;
                yPosition = (yPosition || 0) * yScale;
                if (layer.type == "text") {
                    layer.fontSize =
                        (layer.fontSize || 0) * yScale;
                }
                layer.setDimensions({ height: height, width: width });
                layer.setPosition({ x: xPosition, y: yPosition });
            });
            _this.canvas.renderAll();
            _this.originalSize = dimensions;
            if (_this.canvas.backgroundImage)
                _this.canvas.setBackgroundImage(_this.canvas.backgroundImage, function () {
                    _this.canvas.renderAll();
                }, {
                    scaleX: (dimensions.width || 0) /
                        (_this.canvas.backgroundImage.width || 0) || 0,
                    scaleY: (dimensions.height || 0) /
                        (_this.canvas.backgroundImage.height || 0) || 0,
                });
            _this.canvas.setHeight(dimensions.height);
            _this.canvas.setWidth(dimensions.width);
            _this.canvas.renderAll();
            _this.zoomAndPanManager.update();
        };
        this.resizeViewport = function (dimensions) {
            _this.dimensions = dimensions;
            _this.zoomAndPanManager.update();
        };
        this.save = function () { return __awaiter(_this, void 0, void 0, function () {
            var layers, savedLayers, i, layer, imageLayer, _a, textLayer, backgroundImage, backgroundInfo, file;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        layers = this.layerManager._layers.getValue();
                        savedLayers = [];
                        i = layers.length - 1;
                        _d.label = 1;
                    case 1:
                        if (!(i >= 0)) return [3 /*break*/, 12];
                        _b = {
                            dimensions: layers[i]._dimensions.getValue() || { width: 0, height: 0 }
                        };
                        return [4 /*yield*/, (0, rxjs_1.firstValueFrom)(layers[i].flipX)];
                    case 2:
                        _b.flipX = (_d.sent()) || false;
                        return [4 /*yield*/, (0, rxjs_1.firstValueFrom)(layers[i].flipY)];
                    case 3:
                        _b.flipY = (_d.sent()) || false,
                            _b.id = layers[i].id,
                            _b.type = layers[i].type;
                        return [4 /*yield*/, (0, rxjs_1.firstValueFrom)(layers[i].rotation)];
                    case 4:
                        _b.rotation = (_d.sent()) || 0,
                            _b.position = layers[i]._position.getValue() || { x: 0, y: 0 };
                        return [4 /*yield*/, (0, rxjs_1.firstValueFrom)(layers[i].opacity)];
                    case 5:
                        layer = (_b.opacity = (_d.sent()) || 1,
                            _b);
                        if (!(layer.type == "image")) return [3 /*break*/, 10];
                        imageLayer = layers[i];
                        _a = [__assign({}, layer)];
                        _c = {};
                        return [4 /*yield*/, (0, rxjs_1.firstValueFrom)(imageLayer.brightnessValue)];
                    case 6:
                        _c.brightness = _d.sent();
                        return [4 /*yield*/, (0, rxjs_1.firstValueFrom)(imageLayer.contrastValue)];
                    case 7:
                        _c.contrast = _d.sent();
                        return [4 /*yield*/, (0, rxjs_1.firstValueFrom)(imageLayer.hueValue)];
                    case 8:
                        _c.hue = _d.sent();
                        return [4 /*yield*/, (0, rxjs_1.firstValueFrom)(imageLayer.saturationValue)];
                    case 9:
                        layer = __assign.apply(void 0, _a.concat([(_c.saturation = _d.sent(), _c.src = imageLayer.imageFabricRef.getSrc(), _c)]));
                        _d.label = 10;
                    case 10:
                        if (layer.type == "text") {
                            textLayer = layers[i];
                            layer = __assign(__assign({}, layer), { fontSize: textLayer.fontSize, letterSpacing: textLayer.letterSpacing, lineHeight: textLayer.lineHeight, textColor: textLayer.textColor, fontWeight: textLayer.fontWeight, underline: textLayer.underline, text: textLayer.textRef.get("text"), fontFamily: textLayer.fontFamily, textAlign: textLayer.textAlign });
                        }
                        savedLayers.push(layer);
                        _d.label = 11;
                    case 11:
                        i--;
                        return [3 /*break*/, 1];
                    case 12:
                        if (this.canvas.backgroundImage) {
                            backgroundImage = this.canvas.backgroundImage;
                            backgroundInfo = {
                                src: backgroundImage.getSrc(),
                                scaleX: backgroundImage.scaleX || 1,
                                scaleY: backgroundImage.scaleY || 1,
                            };
                        }
                        file = {
                            layers: savedLayers,
                            size: this.originalSize,
                        };
                        if (backgroundInfo)
                            file.backgroundInfo = backgroundInfo;
                        return [2 /*return*/, file];
                }
            });
        }); };
        this.load = function (file) { return __awaiter(_this, void 0, void 0, function () {
            var backgroundPromise, i, layerData, layer;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.layerManager.deleteAll()];
                    case 1:
                        _b.sent();
                        this.resize(file.size);
                        backgroundPromise = new Promise(function (res, rej) { return res(); });
                        if (file.backgroundInfo)
                            backgroundPromise = this.setBackgroundFromURL((_a = file.backgroundInfo) === null || _a === void 0 ? void 0 : _a.src, file.backgroundInfo.scaleX, file.backgroundInfo.scaleY);
                        else
                            this.canvas.setBackgroundImage(null, function () { });
                        i = 0;
                        _b.label = 2;
                    case 2:
                        if (!(i < file.layers.length)) return [3 /*break*/, 5];
                        layerData = file.layers[i];
                        return [4 /*yield*/, this.addLayerFromSerializedData(layerData)];
                    case 3:
                        layer = _b.sent();
                        layer.setPropertiesFromSerializedData(layerData);
                        _b.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5: return [4 /*yield*/, backgroundPromise];
                    case 6:
                        _b.sent();
                        this.canvas.requestRenderAll();
                        this.canvas.renderAll();
                        this.zoomAndPanManager.update();
                        return [2 /*return*/];
                }
            });
        }); };
        this.waitForLayer = function () {
            var sub;
            return new Promise(function (res) {
                sub = _this.layerManager.layers.subscribe(function (x) {
                    if (x.length >= 1) {
                        res(x[0]);
                        if (sub)
                            sub.unsubscribe();
                    }
                });
            });
        };
        /**
         * @description Please don't use this in parallel. Only one layer can be added at once. Wait for that layer to be added before adding a new layer, otherwise wrong reference can be returned. (You may receive any other layer than the one you have added)
         * @param layer
         * @returns
         */
        this.addLayerFromSerializedData = function (layer) { return __awaiter(_this, void 0, void 0, function () {
            var _a, textLayer, imageLayer;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = layer.type;
                        switch (_a) {
                            case "text": return [3 /*break*/, 1];
                            case "image": return [3 /*break*/, 3];
                        }
                        return [3 /*break*/, 5];
                    case 1:
                        textLayer = layer;
                        return [4 /*yield*/, this.addText(textLayer.text, { fontFamily: textLayer.fontFamily })];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 6];
                    case 3:
                        imageLayer = layer;
                        return [4 /*yield*/, this.addImageFromUrl({
                                imageUrl: imageLayer.src,
                            })];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        {
                            this.drawRectangle({
                                left: 0,
                                top: 0,
                                fill: "red",
                                width: 100,
                                height: 200,
                                selectable: true,
                            });
                        }
                        _b.label = 6;
                    case 6: return [4 /*yield*/, this.waitForLayer()];
                    case 7: return [2 /*return*/, _b.sent()];
                }
            });
        }); };
        this.setBackgroundFromURL = function (url, scaleX, scaleY) {
            return new Promise(function (res, rej) {
                fabric_1.fabric.Image.fromURL(url, function (image) {
                    // if (!canvasRef) return;
                    _this.canvas.setBackgroundImage(image, function () {
                        _this.canvas.renderAll();
                        res();
                    }, {
                        scaleX: scaleX || (_this.canvas.width || 0) / (image.width || 0) || 0,
                        scaleY: scaleY || (_this.canvas.width || 0) / (image.width || 0) || 0,
                        crossOrigin: "allow-credentials"
                        // crossOrigin: "anonymous",
                        // top: 100,
                    });
                });
            });
        };
        this.id = id;
        this.dimensions = dimensions;
        this.originalSize = originalSize;
        this.init();
    }
    DMSCanvas.prototype.init = function () {
        this.canvas = this.createCanvas(this.id, this.originalSize);
        this.canvas.selection = true;
        this.fontManager = new FontManager_1.default();
        this.layerManager = new LayerManager_1.default(this.canvas, this.fontManager);
        this.zoomAndPanManager = new ZoomAndPanManager_1.default(this);
    };
    DMSCanvas.prototype.createCanvas = function (id, dimensions) {
        var canvasOptions = {
            width: dimensions.width,
            height: dimensions.height,
            selection: true,
            backgroundColor: "white",
            selectionFullyContained: true,
        };
        var _canvas = new fabric_1.fabric.Canvas(id, canvasOptions);
        _canvas.preserveObjectStacking = true;
        this.backgroundColor = _canvas.backgroundColor;
        this.backgroundImage = _canvas.backgroundImage;
        _canvas.renderAll();
        return _canvas;
    };
    Object.defineProperty(DMSCanvas.prototype, "selection", {
        get: function () {
            return this.canvas.selection || false;
        },
        set: function (value) {
            this.canvas.selection = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DMSCanvas.prototype, "penMode", {
        get: function () {
            return this.canvas.isDrawingMode || false;
        },
        set: function (value) {
            this.canvas.isDrawingMode = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DMSCanvas.prototype, "penColor", {
        set: function (value) {
            this.canvas.freeDrawingBrush.color = value;
        },
        enumerable: false,
        configurable: true
    });
    DMSCanvas.prototype.toBase64Url = function () {
        this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        this.canvas.setZoom(1);
        var data = this.canvas.toDataURL();
        this.zoomAndPanManager.setZoom(this.zoomAndPanManager._zoom.getValue());
        return data;
    };
    DMSCanvas.prototype.enableCopyPaste = function () {
        var _clipboard;
        var canvas = this.canvas;
        document.addEventListener("keydown", function (e) {
            var _a;
            if (e.ctrlKey && e.key === "c") {
                // Copy selected object
                (_a = canvas.getActiveObject()) === null || _a === void 0 ? void 0 : _a.clone(function (cloned) {
                    _clipboard = cloned;
                });
            }
            else if (e.ctrlKey && e.key === "v") {
                // Paste copied object
                _clipboard === null || _clipboard === void 0 ? void 0 : _clipboard.clone(function (clonedObj) {
                    canvas.discardActiveObject();
                    clonedObj.set({
                        left: clonedObj.left + 10,
                        top: clonedObj.top + 10,
                        evented: true,
                    });
                    if (clonedObj.type === "activeSelection") {
                        clonedObj.canvas = canvas;
                        clonedObj.forEachObject(function (obj) {
                            canvas.add(obj);
                        });
                        clonedObj.setCoords();
                    }
                    else {
                        canvas.add(clonedObj);
                    }
                    _clipboard.top += 10;
                    _clipboard.left += 10;
                    canvas.setActiveObject(clonedObj);
                    canvas.requestRenderAll();
                });
            }
        });
    };
    return DMSCanvas;
}());
exports.default = DMSCanvas;
