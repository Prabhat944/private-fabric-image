import { useRef, useState } from "preact/hooks";
import "./Tools.css";
import React from "preact/compat";

const img = JSON.parse(JSON.stringify({
  "backgroundInfo": {
    "color": "white",
    "scaleX": 1,
    "scaleY": 1,
    "src": "/white-background.jpg"
  },
  "layers": [
    {
      "aspectRatioLock": false,
      "brightness": 0,
      "contrast": 0,
      "dimensions": { "height": 690, "width": 690 },
      "flipX": false,
      "flipY": false,
      "hue": 0,
      "hueShift": [{ "hueShift": 0, "brightnessShift": 0, "saturationShift": 0 }],
      "id": "image1",
      "opacity": 1,
      "originalSrc": "/scooter.png",
      "position": { "x": 400, "y": 400 },
      "rotation": 0,
      "saturation": 0,
      "src": "/scooter.png",
      "tags": [],
      "type": "image"
    }
  ],
  "size": { "height": 1500, "width": 1500 }
}));

const Tools = () => {
  const [showTools,setShowTools] = useState(false);
  const refs = {
    brightness: useRef<any>(null),
    contrast: useRef<any>(null),
    hue: useRef<any>(null),
    saturation: useRef<any>(null),
    blur: useRef<any>(null),
    opacity: useRef<any>(null),
    shadowBlur: useRef<any>(null),
    shadowOpacity: useRef<any>(null),
    shadowHorizontal: useRef<any>(null),
    shadowVertical: useRef<any>(null),
    brushSize: useRef<any>(null),
    color: useRef<any>(null),
    coverage: useRef<any>(null),
    position: useRef<any>(null),
    height: useRef<any>(null),
    width: useRef<any>(null),
  };

  const [copied, setCopied] = useState(false);
  const inputRef = React.createRef();

  const postMessage = (type: string, payload: any) => {
    window.postMessage(JSON.stringify({ type, payload }), '*');
  };

  const handleChange = (type: string, value: any, refKey: string) => {
    if (refs[refKey].current) clearTimeout(refs[refKey].current);
    refs[refKey].current = setTimeout(() => {
      postMessage(type, value / 100);
    }, 300);
  };

  const loadImage = () => {
    const imageData = document.getElementById("inputTextBox");
    const currImage = imageData?.value ? JSON.parse(imageData?.value) : img;
    postMessage("load", { object: currImage });
  };

  const handleShadowChange = () => {
    const payload = {
      blur: refs.shadowBlur.current.value,
      color: `rgba(0,0,0,${refs.shadowOpacity.current.value / 100})`,
      offsetX: refs.shadowHorizontal.current.value,
      offsetY: refs.shadowVertical.current.value,
    };
    postMessage("setShadow", payload);
  };

  const handleResize = () => {
    postMessage("resize", {
      coverage: Number(refs.coverage.current?.value) || 90,
      position: refs.position.current?.value?.toLowerCase() || "center",
      height: refs.height.current?.value || 400,
      width: refs.width.current?.value || 400
    });
  };

  const handleCoverageAndPosition = () => {
    postMessage("setCoverageAndPosition", {
      coverage: Number(refs.coverage.current?.value) || 90,
      position: refs.position.current?.value?.toLowerCase() || "center",
    });
  };

  const handleColorChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    console.log("Color changed to:", target.value);
    postMessage("setBackgroundColor", { hex: target.value });
  };

  const handleCopy = () => {
    const imgElement = document.getElementById('imageData');
    if (imgElement) {
      const base64Data = imgElement.src;
      navigator.clipboard.writeText(base64Data)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => console.error('Failed to copy: ', err));
    }
  };

  return (
    <>
    <button onClick={()=>setShowTools(prev=>!prev)} className="tools-button">{showTools ? "Hide Tools" :"Show Tools"}</button>
    {showTools && <div className="toolTab">
      <div className="tool-container">
        <h4>Input JSON</h4>
        <textarea id="inputTextBox" defaultValue={`${JSON.stringify(img)}`} className="textarea" />
        <button onClick={loadImage} className="button">Load</button>
      </div>
      <div className="slider-container">
        <label htmlFor="brightness">Brightness:</label>
        <input type="range" id="brightness" name="brightness" min="-100" max="100" onChange={(e) => handleChange("setBrightness", e.target.value, "brightness")} />
        <label htmlFor="contrast">Contrast:</label>
        <input type="range" id="contrast" name="contrast" min="-100" max="100" onChange={(e) => handleChange("setContrast", e.target.value, "contrast")} />
        <label htmlFor="hue">Hue:</label>
        <input type="range" id="hue" name="hue" min="-100" max="100" onChange={(e) => handleChange("setHue", e.target.value, "hue")} />
        <label htmlFor="saturation">Saturation:</label>
        <input type="range" id="saturation" name="saturation" min="-100" max="100" onChange={(e) => handleChange("setSaturation", e.target.value, "saturation")} />
        <label htmlFor="blur">Blur:</label>
        <input type="range" id="blur" name="blur" min="0" max="100" onChange={(e) => handleChange("setBlur", e.target.value, "blur")} />
        <label htmlFor="opacity">Opacity:</label>
        <input type="range" id="opacity" name="opacity" min="0" max="100" onChange={(e) => handleChange("setOpacity", e.target.value, "opacity")} />
      </div>
      <div className="shadow-container">
        <label htmlFor="shadowBlur">Shadow Blur:</label>
        <input ref={refs.shadowBlur} type="range" id="shadowBlur" name="shadowBlur" min="0" max="100" />
        <label htmlFor="shadowOpacity">Shadow Opacity:</label>
        <input ref={refs.shadowOpacity} type="range" id="shadowOpacity" name="shadowOpacity" min="0" max="100" />
        <label htmlFor="shadowHorizontal">Shadow Horizontal:</label>
        <input ref={refs.shadowHorizontal} type="range" id="shadowHorizontal" name="shadowHorizontal" min="-100" max="100" />
        <label htmlFor="shadowVertical">Shadow Vertical:</label>
        <input ref={refs.shadowVertical} type="range" id="shadowVertical" name="shadowVertical" min="-100" max="100" />
        <button onClick={handleShadowChange} className="button">Set Shadow</button>
      </div>
      <button onClick={() => postMessage("save", {})} className="button">Save</button>
      <button onClick={() => postMessage("quickLoad", { object: img })} className="button">Quick Load</button>
      <button onClick={() => postMessage("loadWithWatermark", { object: img })} className="button">Load with Watermark</button>
      <div className="slider-container">
        <label htmlFor="brushSize">Brush Size:</label>
        <input type="range" id="brushSize" name="brushSize" min="0" max="100" onChange={(e) => postMessage("setBrushSize", {brushSize: e.target.value})} />
        <button onClick={() => postMessage("toggleEraser", {})} className="button">Toggle Eraser</button>
      </div>
      <div className="color-container">
        <label htmlFor="backgroundColor">Background Color:</label>
        <input type="color" id="backgroundColor" name="backgroundColor" onChange={handleColorChange} />
      </div>
      <div className="resize-container">
        <input type="text" ref={refs.position} placeholder="CENTER, TOP, BOTTOM" />
        <label htmlFor="coverage">Coverage:</label>
        <input type="range" id="coverage" name="coverage" min="0" max="100" ref={refs.coverage} />
        <label htmlFor="height">Height:</label>
        <input type="number" id="height" name="height" min="0" max="2500" ref={refs.height} />
        <label htmlFor="width">Width:</label>
        <input type="number" id="width" name="width" min="0" max="2500" ref={refs.width} />
        <button onClick={handleResize} className="button">Resize</button>
        <button onClick={handleCoverageAndPosition} className="button">Set Coverage and Position *</button>
      </div>
      <button onClick={() => postMessage("getRepositionedView", {})} className="button">Get Repositioned View</button>
      <div className="img-container">
        <img src={""} id="imageData" alt="Preview" />
      </div>
      <div className="tool-container">
        <h4>Output JSON</h4>
        <textarea id="resultTextBox" className="textarea" />
      </div>
      <div>
      <button onClick={handleCopy} className="button">
        {copied ? 'Copied!' : 'Copy Base64'}
      </button>
    </div>
    </div>}
    </>
  );
};

export default Tools;

