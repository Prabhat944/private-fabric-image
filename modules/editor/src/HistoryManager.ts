import { Canvas } from 'fabric/fabric-impl';
import { Observable } from 'rxjs';
import DMSCanvas from './DMSCanvas';

export class HistoryManager {
    private readonly stackSizeLimit = 50;
    private undoStack: string[] = [];
    private redoStack: string[] = [];
    private canvas: Canvas;
    private onChangeObservable: Observable<any>;
    private dmsCanvas: DMSCanvas;

    constructor(canvas: DMSCanvas, onChangeObservable: Observable<any>) {
        this.canvas = canvas.canvas;
        this.dmsCanvas = canvas
        this.onChangeObservable = onChangeObservable;

        this.onChangeObservable.subscribe(() => {
            console.log("History Manager", "Saving State")
            this.saveState();
        });
        console.log("History Manger", this);    
    }

    private async saveState() {
        if (this.undoStack.length >= this.stackSizeLimit) {
            this.undoStack.shift(); // remove the oldest state
        }
        let nextState = JSON.stringify(await this.dmsCanvas.save());
        if(nextState != this.undoStack[this.undoStack.length-1]) {
            this.undoStack.push(nextState);
            this.redoStack = []; // Clear the redo stack when a new change is made
        }
        else {
            console.log("History Manager", "State Not Added to Stack"); 
        }
        
    }

    public async undo() {
        console.log("History Manger", this.undoStack, this.redoStack);
        if (this.undoStack.length > 0) {
            const currentState = this.undoStack.pop();
            if (currentState) {
                this.dmsCanvas.shouldFireModifiedEvent = false;
                this.redoStack.push(currentState);
                if (this.undoStack.length > 0) {
                    const prevState = this.undoStack[this.undoStack.length - 1];
                    // this.dmsCanvas.layerManager._layers.next([]);
                    // this.canvas.clear();
                    await this.dmsCanvas.load(JSON.parse(prevState));
                } 
                this.dmsCanvas.shouldFireModifiedEvent = true;
            }
        }
    }

    public async redo() {
        console.log("History Manger", this.undoStack, this.redoStack);
        if (this.redoStack.length > 0) {
            
            const nextState = this.redoStack.pop();
            if (nextState) {
                this.dmsCanvas.shouldFireModifiedEvent = false;
                this.undoStack.push(nextState);
                await this.dmsCanvas.load(JSON.parse(nextState));
                this.dmsCanvas.shouldFireModifiedEvent = true;
            }
        }
    }

    public clearHistory() {
        this.undoStack = [];
        this.redoStack = [];
    }
}
