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
var Filter_1 = __importDefault(require("./Filter"));
/**
 * TODO: Add Existing filter type as filters in filter manager.
 * TODO: Make sure only one filter of each type can be added. If filter already exists just return its reference.
 */
var FilterManager = /** @class */ (function () {
    function FilterManager(layerFabricRef) {
        var _a;
        this.filters = [];
        this.layerRef = layerFabricRef;
        var existingFilters = __spreadArray([], (this.layerRef.filters || []), true);
        this.layerRef.filters = [];
        this.layerRef.applyFilters();
        (_a = this.layerRef.canvas) === null || _a === void 0 ? void 0 : _a.renderAll();
        for (var _i = 0, existingFilters_1 = existingFilters; _i < existingFilters_1.length; _i++) {
            var filter = existingFilters_1[_i];
            switch (filter.type) {
                case "Brightness":
                    this.add("brightness", filter.brightness);
                    break;
                case "Contrast":
                    this.add("contrast", filter.contrast);
                    break;
                case "Saturation":
                    this.add("saturation", filter.saturation);
                    break;
                case "HueRotation":
                    this.add("hue", filter.rotation);
                    break;
            }
        }
        // }
    }
    FilterManager.prototype.add = function (filterType, value) {
        var _a, _b;
        var filter = this.filters.find(function (x) {
            return x.type == filterType;
        });
        if (filter) {
            return filter;
        }
        var _filter = new Filter_1.default(filterType, value, this.layerRef);
        this.filters.push(_filter);
        (_a = this.layerRef.filters) === null || _a === void 0 ? void 0 : _a.push(_filter.filterRef);
        this.layerRef.applyFilters();
        (_b = this.layerRef.canvas) === null || _b === void 0 ? void 0 : _b.renderAll();
        return _filter;
    };
    FilterManager.prototype.removeById = function (filterId) {
        var _a, _b;
        var filter = this.filters.find(function (filter) { return filter.id === filterId; });
        if (!filter)
            return;
        (_a = this.layerRef.filters) === null || _a === void 0 ? void 0 : _a.splice(this.layerRef.filters.indexOf(filter.filterRef), 1);
        this.filters.splice(this.filters.indexOf(filter), 1);
        (_b = this.layerRef.canvas) === null || _b === void 0 ? void 0 : _b.renderAll();
    };
    return FilterManager;
}());
exports.default = FilterManager;
