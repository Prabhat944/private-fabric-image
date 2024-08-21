//@ts-nocheck
import { fabric } from 'fabric';

const OriginalEraserBrush = fabric.EraserBrush;
export const CustomEraserBrush = fabric.util.createClass(OriginalEraserBrush, {
    onMouseDown: function(options) {
        console.log(this,options,OriginalEraserBrush);  
        OriginalEraserBrush.prototype.onMouseDown.call(this, options);
        var pointer = this.canvas.getPointer(options.e);

        // Clear the upper canvas context when starting to draw
        // this.canvas.clearContext(this.canvas.contextTop);

        // Draw the overlay based on the mode (using the `inverted` property)
        var color = !this.inverted ? 'rgba(0, 255, 0, 0.5)' : 'rgba(255, 0, 0, 0.5)';
        this.canvas.contextTop.fillStyle = color;
        this.canvas.contextTop.beginPath();
        this.canvas.contextTop.arc(pointer.x, pointer.y, this.width / 2, 0, Math.PI * 2, false);
        this.canvas.contextTop.fill();
    },

    onMouseMove: function(pointer) {
        console.log(this,pointer);  
        if (!this._isErasing) {
            // Clear the upper canvas context
            // this.canvas.clearContext(this.canvas.contextTop);

            // Draw the eraser size indicator circle
            this.canvas.contextTop.strokeStyle = 'black';
            this.canvas.contextTop.lineWidth = 1;
            this.canvas.contextTop.beginPath();
            this.canvas.contextTop.arc(pointer.x, pointer.y, this.width / 2, 0, Math.PI * 2, false);
            this.canvas.contextTop.stroke();
        } else {
            OriginalEraserBrush.prototype.onMouseMove.call(this, pointer);
        }
    },

    onMouseUp: function() {
        console.log(this);  
        OriginalEraserBrush.prototype.onMouseUp.call(this);
        // After action, you can clear the context or keep the indication, depending on the behavior you want.
        // this.canvas.clearContext(this.canvas.contextTop);
    }
});

