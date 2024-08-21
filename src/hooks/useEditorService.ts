import { IPixelDimensions, IPosition } from "editor/src/Interfaces";

interface IBoundingBox {
    width: number,
    height: number,
    xOffset: number,
    yOffset: number,
    verticalJustification: "top" | "center" | "bottom",
    horizontalJustification: "left" | "center" | "right",
    rotation: number,
}

export const calcProductImageDimensionsAndPosition = (
    productImageDimensions:IPixelDimensions,
    templateBoundingBox:IBoundingBox,
    scaleX:number,
    scaleY:number
  ) => {
    const templateBBHeight = templateBoundingBox.height * scaleY;
    const templateBBWidth = templateBoundingBox.width * scaleX;
    const templateBBYOffset = templateBoundingBox.yOffset * scaleY;
    const templateBBXOffset = templateBoundingBox.xOffset * scaleX;
    const productRatio = productImageDimensions?.height/productImageDimensions?.width || 1;
    const templateBBRatio = templateBBHeight/templateBBWidth;
    const productImageNewDimensions:IPixelDimensions = {height: 0, width: 0} 
    const productImageNewPosition:IPosition = {x:0,y:0} ;
    // if product height is more than template bounding box
    if(productRatio > templateBBRatio) {
        console.log("PR>TR" , "useEditorInit")
      productImageNewDimensions.height = templateBBHeight;
      productImageNewDimensions.width= templateBBHeight/productRatio;
      // fixing product height, so vertical justification will always be center
      if (templateBoundingBox.horizontalJustification === "center") {

        productImageNewPosition.y = templateBBYOffset;
        productImageNewPosition.x = templateBBXOffset + ((templateBBWidth - productImageNewDimensions.width)/2);
      } else if (templateBoundingBox.horizontalJustification === "left"){
        productImageNewPosition.y = templateBBYOffset;
        productImageNewPosition.x = templateBBXOffset;
      } else {
        productImageNewPosition.y = templateBBYOffset;
        productImageNewPosition.x = templateBBXOffset + (templateBBWidth - productImageNewDimensions.width)
      }
    } else {
      productImageNewDimensions.width = templateBBWidth;
      productImageNewDimensions.height = templateBBWidth * productRatio;
      // fixing product width, so horizontal justification will always be center
      if(templateBoundingBox.verticalJustification === "center"){
        productImageNewPosition.y = templateBBYOffset + ((templateBBHeight - productImageNewDimensions.height)/2);
        productImageNewPosition.x = templateBBXOffset; 
      } else if(templateBoundingBox.verticalJustification === "top"){
        productImageNewPosition.y = templateBBYOffset;
        productImageNewPosition.x = templateBBXOffset;
      } else {
        productImageNewPosition.y = templateBBYOffset + (templateBBHeight - productImageNewDimensions.height);
        productImageNewPosition.x = templateBBXOffset;
      }
    }
    return {dimensions: productImageNewDimensions, position: productImageNewPosition};
};