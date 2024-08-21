import { CanvasFont } from "./Interfaces";
export declare const supportedFonts: CanvasFont[];
export default class FontManager {
    loadedFonts: CanvasFont[];
    loadFont: (name: string) => Promise<void>;
}
