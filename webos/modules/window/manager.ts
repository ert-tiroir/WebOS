import { Draggable } from "../../utils/drag.js";
import { WindowProps } from "./window.js";

export enum MovementType {
    NONE          = 0,
    LEFT_BORDER   = 1,
    RIGHT_BORDER  = 2,
    TOP_BORDER    = 4, 
    BOTTOM_BORDER = 8,
};
class LocalMovement {
    readonly type: number;
    readonly dx:   number;
    readonly dy:   number;
    constructor (type: number, dx: number, dy: number) {
        this.type = type;
        this.dx   = dx;
        this.dy   = dy;
    }

    setType (type: MovementType): LocalMovement {
        return new LocalMovement(type, 0, 0);
    }
    displace (dx: number, dy: number): LocalMovement {
        return new LocalMovement(this.type, this.dx + dx, this.dy + dy);
    }

    apply (rectangle: Rectangle, sizes: Rectangle, screen: Rectangle) {
        let use  = (mask: number, value: number) => {
            return (this.type & mask) == 0 ? 0 : value;
        }
        let left   = rectangle.left   + use(MovementType.LEFT_BORDER,   this.dx);
        let right  = rectangle.right  + use(MovementType.RIGHT_BORDER,  this.dx);
        let top    = rectangle.top    + use(MovementType.TOP_BORDER,    this.dy);
        let bottom = rectangle.bottom + use(MovementType.BOTTOM_BORDER, this.dy);
    
        if (right - left < sizes.left) {
            if ((this.type & MovementType.LEFT_BORDER) != 0) left = right - sizes.left;
            else right = left + sizes.left;
        }
        if (right - left > sizes.right) {
            if ((this.type & MovementType.LEFT_BORDER) != 0) left = right - sizes.right;
            else right = left + sizes.right;
        }
        if (bottom - top < sizes.top) {
            if ((this.type & MovementType.TOP_BORDER) != 0) top = bottom - sizes.top;
            else bottom = top + sizes.top;
        }
        if (bottom - top > sizes.bottom) {
            if ((this.type & MovementType.TOP_BORDER) != 0) top = bottom - sizes.bottom;
            else bottom = top + sizes.bottom;
        }
        
        if (left   < 0             && ((this.type & MovementType.RIGHT_BORDER ) == 0)) left   = 0;
        if (right  > screen.right  && ((this.type & MovementType.LEFT_BORDER  ) == 0)) right  = screen.right;
        if (top    < 0             && ((this.type & MovementType.BOTTOM_BORDER) == 0)) top    = 0;
        if (bottom > screen.bottom && ((this.type & MovementType.TOP_BORDER   ) == 0)) bottom = screen.bottom;

        return (new Rectangle(left, right, top, bottom)).toBoundary(screen);
    }
}

class Rectangle {
    private _left:   number; get left   () { return this._left;   }
    private _right:  number; get right  () { return this._right;  }
    private _top:    number; get top    () { return this._top;    }
    private _bottom: number; get bottom () { return this._bottom; }

    get width  () { return this.right - this.left; }
    get height () { return this.bottom - this.top; }

    constructor (left: number, right: number, top: number, bottom: number) {
        this._left   = left;
        this._right  = right;
        this._top    = top;
        this._bottom = bottom;
    }

    toBoundary (rectangle: Rectangle): Rectangle {
        let clamp = ((a: number, b: number, size: number, min: number, max: number) => {
            if (a < min) return [min, min + size];
            if (b > max) return [max - size, max];

            return [a, b];
        }) as (a: number, b: number, size: number, min: number, max: number) => [number, number];

        let width  = Math.min(this.width,  rectangle.width );
        let height = Math.min(this.height, rectangle.height);
        let [left, right] = clamp( this.left, this.right, width,  rectangle.left, rectangle.right );
        let [top, bottom] = clamp( this.top, this.bottom, height, rectangle.top, rectangle.bottom );
    
        return new Rectangle(left, right, top, bottom);
    }
}

export class WindowContainer {
    readonly window: HTMLElement;

    readonly index: number;

    private _resizable: boolean = true;

    private _clientRectangle : Rectangle;
    private _sizeRectangle   : Rectangle;

    private movement : LocalMovement = new LocalMovement(MovementType.NONE, 0, 0);

    get resizable () { return this._resizable;              }
    get width     () { return this._clientRectangle.width;  }
    get height    () { return this._clientRectangle.height; }
    get minWidth  () { return this._sizeRectangle.left;     }
    get minHeight () { return this._sizeRectangle.top;      }
    get maxWidth  () { return this._sizeRectangle.right;    }
    get maxHeight () { return this._sizeRectangle.bottom;   }

    constructor (_window: HTMLElement, index: number, props: WindowProps, movers: [ HTMLElement, number ][]) {
        this.window = _window;
        this.index  = index;

        if (props.resizable !== undefined)
            this._resizable = props.resizable;

        let _minWidth = 0;        let _minHeight = 0;
        let _maxWidth = Infinity; let _maxHeight = Infinity;
        if (props.minWidth)  _minWidth  = props.minWidth;
        if (props.minHeight) _minHeight = props.minHeight;
        if (props.maxWidth)  _maxWidth  = props.maxWidth;
        if (props.maxHeight) _maxHeight = props.maxHeight;

        let left = (window.innerWidth  - props.width)  / 2;
        let top  = (window.innerHeight - props.height) / 2;

        this._clientRectangle = new Rectangle(left, left + props.width, top, top + props.height);
        this._sizeRectangle   = new Rectangle(_minWidth, _maxWidth, _minHeight, _maxHeight);

        window.addEventListener("click", () => WINDOW_MANAGER.focus(this.index));
        
        for (let [ mover, mask ] of movers) {
            new Draggable(mover, (state: boolean) => {
                if (state) {
                    WINDOW_MANAGER.focus(this.index);
                    this.open(mask);
                } else this.close();
            }, (dx: number, dy: number) => {
                console.log(dx, dy);
                this.update(dx, dy);
            });
        }

        this.update(0, 0);
    }
    getRectangle () {
        let screen = new Rectangle(0, window.innerWidth, 0, window.innerHeight);

        return this.movement.apply(this._clientRectangle, this._sizeRectangle, screen);
    }
    open (type: MovementType) {
        this.movement = this.movement.setType(type);
    }
    update (dx: number, dy: number) {
        this.movement = this.movement.displace(dx, dy);

        let rectangle = this.getRectangle();

        this.window.style.left   = `${rectangle.left}px`;
        this.window.style.top    = `${rectangle.top}px`;
        this.window.style.width  = `${rectangle.width}px`;
        this.window.style.height = `${rectangle.height}px`;
    }
    close () {
        this._clientRectangle = this.getRectangle();

        this.movement = this.movement.setType(MovementType.NONE);
        this.update(0, 0);
    }
}

export class WindowManager {
    windows: { [key: number]: WindowContainer } = {};
    lastWin:    number = 0;
    lastZIndex: number = 1;
    
    registerWindow (window: HTMLElement, props: WindowProps, movers: [ HTMLElement, number ][]): number {
        let index = this.lastWin ++;
        this.windows[index] = new WindowContainer(window, index, props, movers);

        return index;
    }
    focus (index: number) {
        let window = this.windows[index];
        if (window === undefined) return ;
        
        window.window.style.zIndex = this.lastZIndex.toString();
        this.lastZIndex ++;
    }
}

export const WINDOW_MANAGER = new WindowManager();
