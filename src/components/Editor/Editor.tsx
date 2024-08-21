import { useLayoutEffect, useRef, useState } from "preact/hooks";
import useEditorInit from "../../hooks/useEditorInit"
import "./Editor.css"
import { CANVAS_DEFAULT_SIZE } from "../../utils/constants";
import { DMSCanvasFile, SerializedImageLayerInfo, SerializedLayerInfo } from "editor/src/Interfaces";

const productImageLayer: SerializedImageLayerInfo = {
    id: "2D14122022012S",
    type: "image",
    src: "https://images.unsplash.com/photo-1514179974491-a7885781ed87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1020&q=1020",
    dimensions: { height: 1000, width: 1000 },
    position: { x: 100, y: 100 },
    blur: 0,
    brightness: 0,
    contrast: 0,
    saturation: 1,
    hue: 0,
    opacity: 1,
    rotation: 0,
    flipX: false,
    flipY: false,
    aspectRatioLock: false,
    tags: ["product-image"],
}

const rectLayer: SerializedLayerInfo = {
  dimensions: { width: 56.5798480137446, height: 148.11087380219888 },
  flipX: false,
  flipY: false,
  id: "rect1",
  type: "generic",
  rotation: 0,
  position: { x: 265.8795163301996, y: 906.5028704416628 },
  opacity: 1,
  aspectRatioLock: false,
  tags: ["rect-layer"]
};

const exampleDMSObject:DMSCanvasFile = {
  layers: [rectLayer, productImageLayer],
  size: { height: 2000, width: 2000 },
  backgroundInfo: {
    src: "https://images.unsplash.com/photo-1514179974491-a7885781ed87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1020&q=1020",
    scaleX: 1,
    scaleY: 1,
  },
};

const Editor = () => {

    const init = useEditorInit();
    const mainContainerRef = useRef<HTMLDivElement>(null);
    const isEditorInitialized = useRef(false);
    const [loading, setLoading] = useState(false);

    useLayoutEffect(()=>{
        console.log("runing useLayoutEffect", isEditorInitialized.current);
        if(!mainContainerRef.current?.clientWidth) return;
        if(isEditorInitialized.current) return;
        setLoading(true)
        isEditorInitialized.current = true;
        init("canvas",CANVAS_DEFAULT_SIZE,{
            height: mainContainerRef.current?.clientWidth,
            width: mainContainerRef.current?.clientWidth
        },exampleDMSObject).then(()=>{
            setLoading(false);
        });
    },[mainContainerRef,init])

    return (
        <div ref={mainContainerRef}>
            {/* {loading && <div className="loader"></div>} */}
            <canvas id="canvas" height={500} width={500}></canvas>
        </div>
    )
}

export default Editor;