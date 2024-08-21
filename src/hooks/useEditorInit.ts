import DMSCanvas from "editor/src/DMSCanvas";
import { DMSCanvasFile, IPixelDimensions } from "editor/src/Interfaces";
import { useSetAtom } from "jotai";
import { editorAtom } from "../atoms/editor";

export default function useEditorInit() {
    
    const setEditor = useSetAtom(editorAtom);

    const init = async (canvasId: string, originalSize: IPixelDimensions, viewSize: IPixelDimensions, canvasJSON?:DMSCanvasFile) => {
        const editor = new DMSCanvas(canvasId, viewSize, originalSize);
        editor.enableCopyPaste();
        console.log(canvasJSON)
        if(canvasJSON) await editor.load(canvasJSON);
        editor.resize(viewSize)
        
        console.log(editor);
        setEditor(editor);
    }

    return init;
}