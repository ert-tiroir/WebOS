
/**********************************************************************************/
/* webos/renderers/window.js                                                      */
/*                                                                                */
/* This file contains the details for a window, window container and window       */
/* renderer.                                                                      */
/**********************************************************************************/
/*                    This file part of the ERT-Tiroir project                    */
/*                       https://github.com/ert-tiroir/WebOS                      */
/**********************************************************************************/
/* MIT License                                                                    */
/*                                                                                */
/* Copyright (c) 2023 ert-tiroir                                                  */
/*                                                                                */
/* Permission is hereby granted, free of charge, to any person obtaining a copy   */
/* of this software and associated documentation files (the "Software"), to deal  */
/* in the Software without restriction, including without limitation the rights   */
/* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell      */
/* copies of the Software, and to permit persons to whom the Software is          */
/* furnished to do so, subject to the following conditions:                       */
/*                                                                                */
/* The above copyright notice and this permission notice shall be included in all */
/* copies or substantial portions of the Software.                                */
/*                                                                                */
/* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR     */
/* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,       */
/* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE    */
/* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER         */
/* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,  */
/* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE  */
/* SOFTWARE.                                                                      */
/**********************************************************************************/

import { Draggable } from "../drag.js";
import { ElementRenderer } from "./renderer.js";

function clamp (x, a, b) {
    if (x < a) return a;
    if (x > b) return b;
    return x;
}

class IntegerValue {
    constructor (value) {
        this.value = value;
        this.delta = 0;
    }

    update (delta) {
        this.delta += delta;
    }
    flush () {
        this.value += this.delta;
        this.delta  = 0;

        this.value = clamp(this.value, this.lmin, this.lmax);
    }

    getValue (min, max) {
        this.lmin = min; this.lmax = max;

        return clamp(this.value + this.delta, min, max);
    }
}

function createDeltaBorder (classes, target, cl = 0, cr = 0, ct = 0, cb = 0) {
    let el = createElement("div", {}, classes, []);
    el.style.cursor = (cl != 0 || cr != 0) ? "ew-resize" : "ns-resize";

    new Draggable(el, (state) => {
        if (!state) {
            target.left  .flush();
            target.right .flush();
            target.top   .flush();
            target.bottom.flush();
        
            target.applyContainer();
        }
    }, (dx, dy) => {
        target.left  .update(cl * dx);
        target.right .update(cr * dx);
        target.top   .update(ct * dy);
        target.bottom.update(cb * dy);

        target.applyContainer();
    })

    return el;
}

export class Window extends Component {
    isMovable        () { return false; }
    movableHeaderClasses () {
        let size = this.isResizable() ? this.resizeWidth() : 0;
        return `absolute w-full h-2 top-[${size}px] left-0`
    }
    isResizable      () { return false; }
    resizeWidth      () { return 16;     }
    
    getMinimalWidth  () { return 100; }
    getMinimalHeight () { return 100; }
    getDefaultWidth  () { return 100; }
    getDefaultHeight () { return 100; }

    isMinimizable    () { return false; }
    isFullscreenable () { return false; }
    isClosable       () { return false; }
}

class WindowContainer extends Component {
    constructor (window, theme) {
        super(undefined);

        window.parent = this;
        this.window = window;
        this.theme  = theme;

        this._first_render();
    }
    applyContainer () {
        let minW = this.window.getMinimalWidth  ();
        let minH = this.window.getMinimalHeight ();
        let winW = globalThis.window.innerWidth;
        let winH = globalThis.window.innerHeight;

        let l = this.left  .getValue(0, winW);
        let r = this.right .getValue(0, winW);
        let t = this.top   .getValue(0, winH);
        let b = this.bottom.getValue(0, winH);

        let width  = r - l;
        let height = b - t;

        if (width < minW) {
            if (this.left.delta != 0) l = this.left.getValue(0, r - minW);
            else if (this.right.delta != 0) r = this.right.getValue(l + minW, winW);
        }
        if (height < minH) {
            if (this.top.delta != 0) t = this.top.getValue(0, b - minH);
            else if (this.bottom.delta != 0) b = this.bottom.getValue(t + minH, winH);
        }
        width  = r - l;
        height = b - t;

        this.element.style.setProperty("--w", width  + "px");
        this.element.style.setProperty("--h", height + "px");

        this.element.style.left = l + "px";
        this.element.style.top  = t + "px";
    }
    _first_render () {
        this.childrens  = [];
        this.moveHeader = createElement("div", {}, this.window.movableHeaderClasses(), []);
        if (this.window.isMovable()) this.childrens.push(this.moveHeader);

        if (this.window.isResizable()) {
            let size = this.window.resizeWidth();

            this.childrens.push(createDeltaBorder(`absolute h-full w-[${size}px] top-0 left-0`,    this, 1, 0, 0, 0));
            this.childrens.push(createDeltaBorder(`absolute h-full w-[${size}px] top-0 right-0`,   this, 0, 1, 0, 0));
            this.childrens.push(createDeltaBorder(`absolute w-full h-[${size}px] top-0 left-0`,    this, 0, 0, 1, 0));
            this.childrens.push(createDeltaBorder(`absolute w-full h-[${size}px] bottom-0 left-0`, this, 0, 0, 0, 1));
        }

        this.element = this.theme.createWindowContainer({}, "", [ this.window.render(), ...this.childrens ]);
        
        let width  = this.window.getDefaultWidth  ();
        let height = this.window.getDefaultHeight ();
        let winW   = globalThis.window.innerWidth;
        let winH   = globalThis.window.innerHeight;

        this.left   = new IntegerValue((winW - width ) / 2);
        this.right  = new IntegerValue((winW + width ) / 2);
        this.top    = new IntegerValue((winH - height) / 2);
        this.bottom = new IntegerValue((winH + height) / 2);

        this.applyContainer();

        new Draggable(this.moveHeader, (state) => {}, (dx, dy) => {
            let browserW = globalThis.window.innerWidth;
            let browserH = globalThis.window.innerHeight;

            let left   = this.left  .getValue(0, browserW);
            let right  = this.right .getValue(0, browserW);
            let top    = this.top   .getValue(0, browserH);
            let bottom = this.bottom.getValue(0, browserH);

            if (right + dx > browserW)
                dx = browserW - right;
            if (left + dx < 0)
                dx = - left;
            if (bottom + dy > browserH)
                dy = browserH - bottom;
            if (top + dy < 0)
                dy = - top;
            
            this.left  .update(dx);
            this.right .update(dx);
            this.top   .update(dy);
            this.bottom.update(dy);

            this.applyContainer();
        })
    }
    _render () {
        return this.element;
    }
}

export class WindowRenderer extends ElementRenderer {
    constructor (os, window) {
        let container = new WindowContainer(window, os.getTheme());
        super(os, container);

        this.container = container;
    }
}
