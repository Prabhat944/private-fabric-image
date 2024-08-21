//@ts-nocheck
import {  useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";
import "./EditorPreview.css";
import DMSCanvas from "../../../modules/editor/src/DMSCanvas";
import ImageLayer from "../../../modules/editor/src/ImageLayer";
import { EraserModes } from "editor/src/Eraser";
import { calcProductImageDimensionsAndPosition } from "../../hooks/useEditorService";

export default function EditorPreview() { 

    const editor = useRef<DMSCanvas>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(()=>{

        // const consoleLog = (type, log) => window.ReactNativeWebView.postMessage(JSON.stringify({'type': 'Console', 'data': {'type': type, 'log': log}}));
        // console = {
        //     log: (log) => consoleLog('log', log),
        //     debug: (log) => consoleLog('debug', log),
        //     info: (log) => consoleLog('info', log),
        //     warn: (log) => consoleLog('warn', log),
        //     error: (log) => consoleLog('error', log),
        //   };
        
          
        const container = document.getElementsByClassName("container")[0];
        if(!container) return;
        
        console.log("width height",container.clientWidth,container.clientHeight)
        const _editor = new DMSCanvas("editor",{
            width: container.clientWidth,
            height: container.clientHeight
        },{height: container.clientHeight, width: container.clientWidth});
        editor.current = _editor;
        _editor.canvas.getElement().style.pointerEvents = "none";
        _editor.canvas.selection = false;
        _editor.canvas.defaultCursor = 'default';
        _editor.canvas.hoverCursor = 'default';
        _editor.canvas.renderAll();
        _editor.zoomAndPanManager.setZoom(_editor.zoomAndPanManager.$minFitZoom.value)
        console.log({_editor});
        
        const setCoverageAndPosition = async (message) => {
            const productImage = (_editor?.layerManager._layers.getValue().filter(layer=>!layer.getTags()?.includes("grid-line"))[0] as ImageLayer);
            if(!productImage || !message.payload.coverage || !message.payload.position) throw new Error("Invalid payload");
            const {coverage,position:verticalJustification} = message.payload;
            const bbWidth = _editor.originalSize.width * (coverage/100);
            const bbHeight = _editor.originalSize.height * (coverage/100);
            const height =  productImage.fabricRef.height;
            const width =productImage.fabricRef.width;
            const productImageDimensions = {height,width};
            console.log({height, width});   
            console.log(productImage.fabricRef.width, productImage.fabricRef.height, productImage.fabricRef.scaleX, productImage.fabricRef.scaleY)
            const {position, dimensions} = calcProductImageDimensionsAndPosition(productImageDimensions,{
                width: bbWidth,
                height: bbHeight,
                xOffset:( _editor.originalSize.width - bbWidth)/2,
                yOffset: (_editor.originalSize.height - bbHeight)/2,
                horizontalJustification: 'center',
                verticalJustification,
            },1,1);
            console.log({position, dimensions});
            productImage.setPosition(position);
            productImage.setDimensions(dimensions);
            _editor.canvas.renderAll();
            
       }

        [window, document].forEach(x=>x.addEventListener("message", async(e)=>{
            
            const message = JSON.parse(e.data); 
            // console.log(_editor.dimensions.height, message);
            // alert(_editor.dimensions.height)
            if(message.type === "load") _editor?.load(message.payload.object).then((res)=>{
                console.log("Loaded",_editor)
                const base64 = _editor?.toBase64Url();
                // console.log("Got Base 64");
                _editor.zoomAndPanManager.setZoom(_editor.zoomAndPanManager.$minFitZoom?.value)
                // console.log(base64);
                const showImgPreview = document.getElementById("imageData");
                if(showImgPreview){
                    showImgPreview.src = base64;   
                }
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: "editorLoaded",
                    payload: {
                        object: base64
                    }   
                }));
            });
            if(message.type === "setBrightness") {
                (_editor?.layerManager._layers.getValue().filter(layer=>!layer.getTags()?.includes("grid-line"))[0] as ImageLayer).setBrightness(message.payload);
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: "brightnessSet",  
                }));
            }
            if(message.type === "setContrast") {
                (_editor?.layerManager._layers.getValue().filter(layer=>!layer.getTags()?.includes("grid-line"))[0] as ImageLayer).setContrast(message.payload);
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: "contrastSet",
                }));
            }
            if(message.type === "setHue") {
                (_editor?.layerManager._layers.getValue().filter(layer=>!layer.getTags()?.includes("grid-line"))[0] as ImageLayer).setHue(message.payload);
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: "hueSet",
                })); 
            }
            if(message.type === "setSaturation") {
                (_editor?.layerManager._layers.getValue().filter(layer=>!layer.getTags()?.includes("grid-line"))[0] as ImageLayer).setSaturation(message.payload);
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: "saturationSet",
                })); 
            }
            if(message.type === "setBlur") {
                (_editor?.layerManager._layers.getValue().filter(layer=>!layer.getTags()?.includes("grid-line"))[0] as ImageLayer).setBlur(message.payload);
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: "blurSet",
                }));
            }
            if(message.type === "setOpacity") {
                (_editor?.layerManager._layers.getValue().filter(layer=>!layer.getTags()?.includes("grid-line"))[0] as ImageLayer).setOpacity(message.payload);
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: "opacitySet",
                }));
            }
            if(message.type === "setShadow") {
                (_editor?.layerManager._layers.getValue().filter(layer=>!layer.getTags()?.includes("grid-line"))[0] as ImageLayer).setShadow(message.payload);
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: "shadowSet",
                }));
            }
            if(message.type === "save") {
                _editor?.save().then(file=>{
                    const resultTextBox = document.getElementById("resultTextBox");
                    if(resultTextBox){
                        resultTextBox.value = JSON.stringify(file);
                    }
                    const base64 = _editor?.toBase64Url();
                    const showImgPreview = document.getElementById("imageData");
                    if(showImgPreview){
                        showImgPreview.src = base64;   
                    }
                    setTimeout(()=>window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: "saved",
                        payload: {
                            object: {...file,layers:file?.layers?.filter(e=>!e?.tags?.includes("grid-line"))}
                        }
                    })),300);
                })
            }
            if(message.type === "quickLoad") {
                _editor.load(message.payload.object).then(async e=>{
                    // await _editor?.resize({height:500, width:500});
                    const aspectRatio = _editor.originalSize.width/_editor.originalSize.height;
                    const height = (aspectRatio > 1) ? 500/aspectRatio : 500;
                    const width = (aspectRatio > 1) ? 500 : 500*aspectRatio;
                    await _editor?.resize({height, width});
                    const base64 = _editor?.toBase64Url();
                    _editor.zoomAndPanManager.setZoom(_editor.zoomAndPanManager.$minFitZoom?.value)
                    const showImgPreview = document.getElementById("imageData");
                    if(showImgPreview){
                        showImgPreview.src = base64;   
                    }
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: "editorLoaded",
                        payload: {
                            object: base64
                        }   
                    }));
                })   
            }
            if(message.type === "loadWithWatermark") {
                // console.log("Loading with Watermark!", message);
                _editor.load(message.payload.object).then(e=>{
                    _editor.zoomAndPanManager.setZoom(_editor.zoomAndPanManager.$minFitZoom?.value)
                    _editor.addImageFromUrl({
                        imageUrl:"https://assets.dresma.com/DoMyShoot/App%20Screens/Final+Watermark.png",
                        position: {x:0,y:0},
                        dimensions: editor.originalSize
                    }).then(async imageRef=>{
                        await _editor?.resize({height:300, width:300});
                        const base64 = _editor?.toBase64Url();
                        const showImgPreview = document.getElementById("imageData");
                        if(showImgPreview){
                            showImgPreview.src = base64;   
                        }
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: "editorLoaded",
                            payload: {
                                object: base64
                            }   
                        }));
                    })   
                })   
            }

            if(message.type === "toggleEraser") {
                // console.log("Toggling Eraser!", message);
                (async () => {
                    try {
                        if (_editor && _editor?.canvas.viewportTransform && !_editor.layerManager._layers.getValue().find(layer=>layer.getTags()?.includes("grid-line"))) {
                            // Create grid lines
                            const gridSpace = Math.min(_editor?.canvas.height, _editor?.canvas.width) / 10;
                            const gridColor = 'rgba(235, 46, 131, 1)';
                            const maxIterations = Math.max(_editor?.canvas.width / gridSpace, _editor?.canvas.height / gridSpace);
                            
                            const linePromises = [];
            
                            for (let i = 1; i < maxIterations; i++) {
                                if (i < (_editor?.canvas.width / gridSpace)) {
                                    const verticalLine = new fabric.Line([i * gridSpace, 0, i * gridSpace, _editor?.canvas.height], { stroke: gridColor, selectable: false, evented: false });
                                    _editor?.canvas.add(verticalLine);
                                    linePromises.push(_editor.getLayerByRef(verticalLine));
                                }
                                if (i < (_editor?.canvas.height / gridSpace)) {
                                    const horizontalLine = new fabric.Line([0, i * gridSpace, _editor?.canvas.width, i * gridSpace], { stroke: gridColor, selectable: false, evented: false });
                                    _editor?.canvas.add(horizontalLine);
                                    linePromises.push(_editor.getLayerByRef(horizontalLine));
                                }
                            }
            
                            const layers = await Promise.all(linePromises);
                            layers.forEach(layer => layer.addTag("grid-line"));
            
                            let gridLines = _editor?.layerManager._layers.value.filter(layer => layer.getTags()?.includes("grid-line"));
                            gridLines.forEach(layer => {
                                let currOpacity = 0;
                                const opacitySubscription = layer.opacity.subscribe(val => { currOpacity = val });
                                layer.setOpacity(currOpacity ? 0 : 1);
                                opacitySubscription.unsubscribe();
                            });
            
                            _editor?.canvas.renderAll();
                        }
                        _editor.eraser.toggle(EraserModes.LAYER, _editor.layerManager._layers.getValue().filter(layer=>!layer.getTags()?.includes("grid-line"))[0]);
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: "eraserToggled"
                        }));
                    } catch (error) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: "eraserToggled",
                            message: "failed"
                        }));
                    }
                })();
            }

            if( message.type === "setBrushSize") {
                // console.log("Setting Brush Size", message);
                _editor.eraser.brushSize = message.payload.brushSize || 100;
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: "brushSizeSet"
                }))
            }

            if( message.type === "setInverted") {
                console.log("Setting Brush Size", message);
                _editor.eraser.inverted = !!!message.payload.inverted;
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: "invertedSet"
                }))
            }

            if(message.type == "setHueShift") {
                (_editor?.layerManager._layers.getValue().filter(layer=>!layer.getTags()?.includes("grid-line"))[0] as ImageLayer)?.setHueShift(message.payload.index,message.payload.value)
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type:"hueShiftSet"
                }))
            }
            if( message.type === "addGrid") {
                console.log("Adding Grid lines", message);
                if (!_editor || !_editor?.canvas.viewportTransform) return;
                let addGrid = true;
                let gridLines = _editor?.layerManager._layers.getValue().filter(layer=>layer.getTags()?.includes("grid-line"));
                if(gridLines.length > 0) addGrid = false;
                gridLines.map(async(layer)=>{
                    let currOpacity = 0;
                    const opacitySubscription = layer.opacity.subscribe((val)=>{currOpacity = val})
                    layer.setOpacity(currOpacity ? 0 : 1);
                    opacitySubscription.unsubscribe();
                });
                
                if(!addGrid){
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: "gridAdded",
                        payload: {
                            object: {success:true}
                        }
                    }))
                    return;
                }
                // Create grid lines
                const gridSpace = Math.min(_editor?.canvas.height, _editor?.canvas.width) / 10;
                const gridColor = 'rgba(235, 46, 131, 1)';
                const maxIterations = Math.max(_editor?.canvas.width / gridSpace, _editor?.canvas.height / gridSpace);
                
                for (let i = 1; i < maxIterations; i++) {
                    if (i < (_editor?.canvas.width / gridSpace)) {
                        const verticalLine = new fabric.Line([i * gridSpace, 0, i * gridSpace, _editor?.canvas.height], { stroke: gridColor, selectable: false, evented: false });
                        _editor?.canvas.add(verticalLine);
                        const svgLayerV = await _editor.getLayerByRef(verticalLine);
                        svgLayerV.addTag("grid-line");
                    }
                    if (i < (_editor?.canvas.height / gridSpace)) {
                        const horizontalLine = new fabric.Line([0, i * gridSpace, _editor?.canvas.width, i * gridSpace], { stroke: gridColor, selectable: false, evented: false });
                        _editor?.canvas.add(horizontalLine);
                        const svgLayerH = await _editor.getLayerByRef(horizontalLine);
                        svgLayerH.addTag("grid-line");
                    }
                }
                _editor?.canvas.renderAll();
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: "gridAdded",
                    payload: {
                        object: {success:true}
                    }
                }))
            }
            if(message.type === "setBackgroundColor") {
                console.log("Set Background");
                const opacityRegex = /([0-9a-fA-F]{6})00$/;
                if(opacityRegex.test(message.payload.hex || message.hex))_editor.setBackgroundFromURL('./../../assets/transparentImage.png');
                else{_editor.setBackgroundFromURL(null);
                _editor.setBackgroundColor(message.payload.hex || message.hex || "black");
                }
                // _editor.canvas.renderAll();
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: "backgroundColorSet"
                }))
            }
            if(message.type === "setCoverageAndPosition") {
                await setCoverageAndPosition(message).catch(console.error);
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: "coverageAndPositionSet"
                }))
            }
          
            if(message.type === "resize") {
                
                const {coverage,position,height,width} = message.payload;
                console.log({coverage,position,height,width})
                await _editor?.resize({height,width});
                _editor.zoomAndPanManager.setZoom(_editor.zoomAndPanManager.$minFitZoom?.value)
                if(coverage) await setCoverageAndPosition(message);
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: "resized" 
                }));
            }
            if( message.type === "getRepositionedView") {
                const canvasJSONData = await _editor?.save();
                const layer = await (_editor?.layerManager._layers.getValue().filter(layer=>!layer.getTags()?.includes("grid-line"))[0] as ImageLayer)
                const newWidth = 0.009 * 100 * _editor.originalSize.width;
                const newHeight = 0.009 * 100 * _editor.originalSize.height;
                const productImageNaturalDimensions = {
                    height: layer?.fabricRef.height,
                    width: layer?.fabricRef.width
                }
                const boundingBox: IBoundingBox = {
                    height: newHeight,
                    width: newWidth,
                    yOffset: (_editor.originalSize.height - newHeight) / 2,
                    xOffset: (_editor.originalSize.width - newWidth) / 2,
                    verticalJustification: "center",
                    horizontalJustification: "center",
                    rotation: 0
                }
                layer.setRotation(0);
                const {position, dimensions} =  calcProductImageDimensionsAndPosition(productImageNaturalDimensions,boundingBox,1,1);
                layer.setDimensions(dimensions);
                layer.setPosition(position);
                layer.setRotation(canvasJSONData?.layers[0].rotation);
                await _editor?.setBackgroundColor("#00000000");
                await _editor?.setBackgroundFromURL(null);
                const base64 = _editor.toBase64Url();
                await _editor.load(canvasJSONData);
                const showImgPreview = document.getElementById("imageData");
                if(showImgPreview){
                    showImgPreview.src = base64;   
                }
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: "editorLoaded",
                    payload: {
                        object: base64
                    }   
                }));
            }
        }));

        window?.ReactNativeWebView?.postMessage(JSON.stringify({
            type: "load",
        }));
        
        console.log(_editor);
        
    },[])


    useEffect(()=>{
        const listener = window.addEventListener("resize",()=>{
            console.log("Resized",containerRef.current?.clientHeight, containerRef.current?.clientWidth)
            console.log(editor.current)
            editor.current?.resizeViewport({
                height: containerRef.current?.clientHeight || 0,
                width: containerRef.current?.clientWidth || 0
            })
            editor.current?.zoomAndPanManager.setZoom(editor.current.zoomAndPanManager.$minFitZoom.value)
        });

        return ()=>{
            window.removeEventListener(listener);
        }
    },[])

    return <div ref={containerRef} className={"container"}>
        <canvas id="editor">
        </canvas>
    </div>
}