"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.supportedFonts = void 0;
exports.supportedFonts = [
    {
        name: "Roboto",
        url: "https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap",
        fontFaceUrl: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2",
    },
    {
        name: "Open Sans",
        fontFaceUrl: "https://fonts.gstatic.com/s/opensans/v34/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0B4gaVIUwaEQbjA.woff2",
        url: "https://fonts.googleapis.com/css2?family=Open+Sans&display=swap",
    },
];
var FontManager = /** @class */ (function () {
    function FontManager() {
        var _this = this;
        this.loadedFonts = [];
        this.loadFont = function (name) { return __awaiter(_this, void 0, void 0, function () {
            var canvasFont, isFontLoaded, link, font, loadedFont;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        canvasFont = exports.supportedFonts.find(function (x) { return x.name === name; });
                        if (!canvasFont)
                            throw new Error("Invalid Font name");
                        isFontLoaded = this.loadedFonts.find(function (x) { return x.name === name; });
                        if (isFontLoaded)
                            return [2 /*return*/];
                        link = document.createElement("link");
                        link.href = canvasFont.url;
                        link.rel = "stylesheet";
                        document.head.appendChild(link);
                        font = new FontFace(canvasFont.name, "url('".concat(canvasFont.fontFaceUrl, "')"));
                        return [4 /*yield*/, font.load()];
                    case 1:
                        loadedFont = _a.sent();
                        this.loadedFonts.push(canvasFont);
                        document.fonts.add(loadedFont);
                        return [2 /*return*/];
                }
            });
        }); };
    }
    return FontManager;
}());
exports.default = FontManager;
