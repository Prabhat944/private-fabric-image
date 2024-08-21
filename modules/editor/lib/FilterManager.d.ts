import Filter from "./Filter";
import { FilterType } from "./Interfaces";
/**
 * TODO: Add Existing filter type as filters in filter manager.
 * TODO: Make sure only one filter of each type can be added. If filter already exists just return its reference.
 */
export default class FilterManager {
    filters: Filter[];
    layerRef: fabric.Image;
    constructor(layerFabricRef: fabric.Image);
    add(filterType: FilterType, value: number): Filter;
    removeById(filterId: string): void;
}
