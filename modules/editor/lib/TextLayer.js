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
var fabric_1 = require("fabric");
var rxjs_1 = require("rxjs");
var Layer_1 = __importDefault(require("./Layer"));
var TextLayer = /** @class */ (function (_super) {
    __extends(TextLayer, _super);
    function TextLayer(obj, fontManager, name) {
        var _this = _super.call(this, obj, name) || this;
        _this._editing = new rxjs_1.BehaviorSubject(false);
        _this.editing = _this._editing.asObservable();
        _this.textRef = obj;
        _this.fontManager = fontManager;
        _this.textRef.lockScalingY = true;
        // this.textRef.lockScalingX = true;
        // this.textRef.textAlign = "justify";
        _this.setListeners();
        return _this;
    }
    TextLayer.prototype.setListeners = function () {
        var _this = this;
        this.textRef.on("editing:entered", function (e) {
            _this._editing.next(true);
        });
        this.textRef.on("editing:exited", function (e) {
            ;
            _this._editing.next(false);
        });
        this.textRef.on("event:changed", function (e) {
            ;
            console.log({ e: e });
            _this.textRef.getMinWidth();
            _this.setDimensions({
                height: _this.textRef.getScaledHeight(),
                width: _this.textRef.getMinWidth()
            });
        });
        this.textRef.on("modified", function (e) {
            console.log("Modified", _this.textRef.fontSize, _this.textRef.scaleY);
        });
        this.textRef.on("resizing", function (e) {
            _this._dimensions.next({
                height: e.transform.target.getScaledHeight(),
                width: e.transform.target.getScaledWidth(),
            });
        });
    };
    Object.defineProperty(TextLayer.prototype, "fontSize", {
        get: function () {
            return this.textRef.fontSize;
        },
        set: function (value) {
            var _a, _b;
            this.textRef.fontSize = value;
            (_a = this.textRef.canvas) === null || _a === void 0 ? void 0 : _a.renderAll();
            this._dimensions.next({
                height: this.textRef.getScaledHeight() || 0,
                width: this.textRef.getScaledWidth() || 0,
            });
            (_b = this.textRef.canvas) === null || _b === void 0 ? void 0 : _b.renderAll();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextLayer.prototype, "textColor", {
        get: function () {
            return this.textRef.get("fill");
        },
        set: function (value) {
            var _a;
            this.textRef.set("fill", value);
            (_a = this.textRef.canvas) === null || _a === void 0 ? void 0 : _a.renderAll();
        },
        enumerable: false,
        configurable: true
    });
    TextLayer.prototype.setDimensions = function (dimensions) {
        var _a;
        if (dimensions.width < this.textRef.getMinWidth()) {
            dimensions.width = this.textRef.getMinWidth();
        }
        dimensions.height = this.textRef.getScaledHeight();
        this.textRef.width = dimensions.width;
        (_a = this.textRef.canvas) === null || _a === void 0 ? void 0 : _a.renderAll();
        var x = this.fabricRef.left || 0;
        var y = this.fabricRef.top || 0;
        this._dimensions.next(dimensions);
        this._position.next({ x: x, y: y });
    };
    Object.defineProperty(TextLayer.prototype, "fontWeight", {
        get: function () {
            return this.textRef.fontWeight;
        },
        set: function (value) {
            var _a;
            this.textRef.fontWeight = value;
            (_a = this.fabricRef.canvas) === null || _a === void 0 ? void 0 : _a.renderAll();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextLayer.prototype, "underline", {
        get: function () {
            return this.textRef.get("underline");
        },
        set: function (value) {
            var _a;
            this.textRef.set("underline", value);
            (_a = this.fabricRef.canvas) === null || _a === void 0 ? void 0 : _a.renderAll();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextLayer.prototype, "italic", {
        get: function () {
            return this.textRef.get("fontStyle") === "italic";
        },
        set: function (value) {
            var _a;
            this.textRef.set("fontStyle", value ? "italic" : "");
            (_a = this.fabricRef.canvas) === null || _a === void 0 ? void 0 : _a.renderAll();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextLayer.prototype, "letterSpacing", {
        get: function () {
            return this.textRef.get("charSpacing");
        },
        set: function (value) {
            var _a;
            this.textRef.set("charSpacing", value);
            (_a = this.fabricRef.canvas) === null || _a === void 0 ? void 0 : _a.renderAll();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextLayer.prototype, "lineHeight", {
        get: function () {
            return this.textRef.get("lineHeight");
        },
        set: function (value) {
            var _a;
            this.textRef.set("lineHeight", value);
            (_a = this.fabricRef.canvas) === null || _a === void 0 ? void 0 : _a.renderAll();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextLayer.prototype, "fontFamily", {
        get: function () {
            console.log("Getting Font family");
            return this.textRef.get("fontFamily");
        },
        set: function (value) {
            var _this = this;
            this.fontManager.loadFont(value || "Roboto").then(function () {
                var _a;
                _this.textRef.set("fontFamily", value);
                _this.textRef.initDimensions();
                fabric_1.fabric.util.clearFabricFontCache(value);
                window.setTimeout(function () {
                    var _a;
                    _this.textRef.set("fontFamily", value);
                    _this.textRef.initDimensions();
                    (_a = _this.textRef.canvas) === null || _a === void 0 ? void 0 : _a.requestRenderAll();
                }, 100);
                (_a = _this.textRef.canvas) === null || _a === void 0 ? void 0 : _a.renderAll();
            });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextLayer.prototype, "textAlign", {
        get: function () {
            return this.textRef.get("textAlign");
        },
        set: function (value) {
            var _a;
            this.textRef.set("textAlign", value);
            (_a = this.fabricRef.canvas) === null || _a === void 0 ? void 0 : _a.renderAll();
        },
        enumerable: false,
        configurable: true
    });
    TextLayer.prototype.setPropertiesFromSerializedData = function (data) {
        _super.prototype.setPropertiesFromSerializedData.call(this, data);
        this.fontSize = data.fontSize;
        this.textColor = data.textColor;
        this.fontWeight = data.fontWeight;
        this.underline = data.underline;
        this.italic = data.italic;
        this.letterSpacing = data.letterSpacing;
        this.lineHeight = data.lineHeight;
        this.textAlign = data.textAlign;
    };
    return TextLayer;
}(Layer_1.default));
exports.default = TextLayer;
