import { BehaviorSubject } from "rxjs";
import { CanvasFont, CanvasFontStyles } from "./Interfaces";
import FontFaceObserver from "fontfaceobserver";
const baseFonts = [
  {
        name: "Roboto",
        url: "https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap",
        fontFaceUrl:
          "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2",
      },
      {
        name: "Open Sans",
        fontFaceUrl:
          "https://fonts.gstatic.com/s/opensans/v34/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0B4gaVIUwaEQbjA.woff2",
        url: "https://fonts.googleapis.com/css2?family=Open+Sans&display=swap",
      },
];
export default class FontManager {
  loadedFonts: CanvasFont[] = [];
  $supportedFonts = new BehaviorSubject<CanvasFont[]>(baseFonts);

  supportedFonts = this.$supportedFonts.asObservable();

  loadFont = async (name: string, style?: CanvasFontStyles) => {
    const canvasFont = this.$supportedFonts.getValue().find((x) => x.name === name);
    if (!canvasFont) throw new Error("Invalid Font name");
    const isFontLoaded = this.loadedFonts.find((x) => x.name === name);
    if (isFontLoaded) return;
    if(!(canvasFont.url instanceof Array)) canvasFont.url = [canvasFont.url];

    canvasFont.url.forEach(async url=>{
      if(!url.includes("googleapis.com")) {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
          @font-face {
            font-family: '${canvasFont.name}';
            src: url('${url}');
            fontWeight: ${url.toLowerCase().includes("bold")?"bold":"normal"};
            fontStyle: ${url.toLowerCase().includes("italic")?"italic":"normal"};
            underline: ${url.toLowerCase().includes("underline")?"underline":"none"};
          }
        `;
        document.head.append(styleElement);
        return;
      }
      const link = document.createElement("link");
      link.href = url;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    });

    var font = new FontFaceObserver(canvasFont.name,{
      weight: style?.fontWeight || "normal",
      style: style?.italic?"italic":"normal" || "normal",
    });
    await font.load().catch(console.error);
    this.loadedFonts.push(canvasFont);
  };

  setSupportedFonts = (fonts: CanvasFont[]) => {
    this.$supportedFonts.next([...baseFonts,...fonts])
  }

}
