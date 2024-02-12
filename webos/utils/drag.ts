
const workingDraggables = new Set<Draggable>();

if (globalThis.document !== undefined) {
    document.body.addEventListener("dragover", (ev) => {
        let cx = ev.clientX;
        let cy = ev.clientY;

        for (let draggable of workingDraggables)
            draggable.onMove(cx, cy);
    })
}

const EMPTY_DRAG_IMAGE = ((function () {
    if (globalThis.document === undefined) return undefined;

    let image = document.createElement("img");
    image.src = "/assets/empty.png"

    return image;
})()) as HTMLImageElement;

export class Draggable {
    element: HTMLElement;

    stateCallback: (state: boolean) => void;
    moveCallback:  (dx: number, dy: number) => void;

    lx: number;
    ly: number;
    
    constructor (element: HTMLElement, stateCallback: (state: boolean) => void, moveCallback: (dx: number, dy: number) => void) {
        this.element = element;
        (this.element as any).draggable = "true";

        this.moveCallback = moveCallback;
        this.lx = 0;
        this.ly = 0;
        
        this.element.addEventListener("dragstart", (event) => {
            this.lx = event.clientX;
            this.ly = event.clientY;

            workingDraggables.add(this);
            stateCallback(true);

            if (event.dataTransfer !== null)
                event.dataTransfer.setDragImage(EMPTY_DRAG_IMAGE, -99999, -99999);
        });
        this.element.addEventListener("dragend", (_event) => {
            stateCallback(false);
            workingDraggables.delete(this);
        });
    }

    onMove (cx: number, cy: number) {
        let dx = cx - this.lx;
        let dy = cy - this.ly;

        this.moveCallback(dx, dy);

        this.lx = cx;
        this.ly = cy;
    }
}