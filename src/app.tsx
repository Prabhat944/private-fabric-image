import Editor from "./components/Editor/Editor";
import EditorPreview from "./components/EditorPreview/EditorPreview";
import Tools from "./components/Tools/Tools";

export function App() {

  //@ts-ignore
  // console.log = window.ReactNativeWebView.postMessage;

  return (<div>
    <EditorPreview />
   <Tools />
   {/* <Editor /> */}
  </div>)
}
