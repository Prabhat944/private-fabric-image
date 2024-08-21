import { fabric } from "fabric";
import { HueShiftFilterValue } from "./Filter";

export type Units = "px" | "em" | "%" | "vh" | "vw";
export type Measurement = `${number}${Units}`;
export type FilterType = "brightness" | "contrast" | "saturation" | "hue" | "blur" | "hueShift";
export type AlignmentType =
  | "top"
  | "centerY"
  | "bottom"
  | "left"
  | "centerX"
  | "right";

export type fabricEventHandler = (
  this: fabric.Canvas,
  opt: fabric.IEvent<any>
) => void;

export type ActiveTab = "layers" | "tools";
// type Enumerate<
//   N extends number,
//   Acc extends number[] = []
// > = Acc["length"] extends N
//   ? Acc[number]
//   : Enumerate<N, [...Acc, Acc["length"]]>;

// type Range<F extends number, T extends number> = Exclude<
//   Enumerate<T>,
//   Enumerate<F>
// >;

// export type filterValue = Range<-1, 1>;

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
  aspectRatioLock: boolean;
  tags: string[] | undefined;
  shadow: IShadowOptions | undefined;
  eraser?:any,
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
  hueShift: HueShiftFilterValue[];
  blur?: number;
  originalSrc?: string;
}

export interface SerializedCanvasBackground {
  src: string;
  scaleX: number;
  scaleY: number;
  color?: string;
}

export interface DMSCanvasFile {
  layers: (
    | SerializedLayerInfo
    | SerializedImageLayerInfo
    | SerializedTextLayerInfo
  )[];
  size: IPixelDimensions;
  backgroundInfo?: SerializedCanvasBackground;
}

export interface SerializedFillInfo {
  backgroundImageSrc: string;
  backgroundImageOffsetX: number;
  backgroundImageOffsetY: number;
  backgroundImageHeight: number;
  backgroundImageWidth: number;
  backgroundImageZoom: number;
  backgroundColor: string;
  positionX: number; // -100 to 100
  positionY: number; // -100 to 100
  imageRotation: number;
  imageOpacity: number;
  dimensions: IPixelDimensions;
}

export interface SerializedSVGLayerInfo extends SerializedLayerInfo {
  fill: SerializedFillInfo;
  borderColor: string;
  borderThickness: number;
  url:string,
}

export interface CanvasFont {
  name: string;
  url: string | string[];
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

export interface IShadowOptions {
  color: string,
  blur: number,
  offsetX: number,
  offsetY: number,
}

export type TextAlignment = "center" | "left" | "right" | "justify";