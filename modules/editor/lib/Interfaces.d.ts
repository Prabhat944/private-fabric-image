import { fabric } from "fabric";
export type Units = "px" | "em" | "%" | "vh" | "vw";
export type Measurement = `${number}${Units}`;
export type FilterType = "brightness" | "contrast" | "saturation" | "hue";
export type AlignmentType = "top" | "centerY" | "bottom" | "left" | "centerX" | "right";
export type fabricEventHandler = (this: fabric.Canvas, opt: fabric.IEvent<any>) => void;
export type ActiveTab = "layers" | "tools";
export interface IPixelDimensions {
    height: number;
    width: number;
}
export interface IPosition {
    x: number;
    y: number;
}
export interface IDimensions {
    height: Measurement;
    width: Measurement;
}
export interface IImageOptions {
    imageUrl: string;
    position?: IPosition;
    dimensions?: IPixelDimensions;
}
export interface SerializedLayerInfo {
    id: string;
    type: string;
    dimensions: IPixelDimensions;
    position: IPosition;
    opacity: number;
    rotation: number;
    flipX: boolean;
    flipY: boolean;
}
export interface SerializedTextLayerInfo extends SerializedLayerInfo {
    fontSize: number;
    textColor: string | fabric.Pattern | fabric.Gradient | undefined;
    fontWeight: string | number | undefined;
    underline: boolean;
    italic: boolean;
    letterSpacing: number;
    lineHeight: number;
    text: string;
    fontFamily: string;
    textAlign: TextAlignment;
}
export interface SerializedImageLayerInfo extends SerializedLayerInfo {
    src: string;
    brightness: number;
    contrast: number;
    saturation: number;
    hue: number;
    blur?: number;
}
export interface SerializedCanvasBackground {
    src: string;
    scaleX: number;
    scaleY: number;
}
export interface DMSCanvasFile {
    layers: (SerializedLayerInfo | SerializedImageLayerInfo | SerializedTextLayerInfo)[];
    size: IPixelDimensions;
    backgroundInfo?: SerializedCanvasBackground;
}
export interface CanvasFont {
    name: string;
    url: string;
    fontFaceUrl: string;
}
export interface CanvasFontStyles {
    fontSize?: number;
    textColor?: string | fabric.Pattern | fabric.Gradient | undefined;
    fontWeight?: string | number | undefined;
    underline?: boolean;
    italic?: boolean;
    letterSpacing?: number;
    lineHeight?: number;
    fontFamily?: string;
}
export type TextAlignment = "center" | "left" | "right" | "justify";
