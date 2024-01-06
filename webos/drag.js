
/**********************************************************************************/
/* webos/drag.js                                                                  */
/*                                                                                */
/* This file contains an extension of the HTML Drag API to capture movement of    */
/* objects using drag                                                             */
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

const workingDraggables = new Set();

document.body.addEventListener("dragover", (ev) => {
    let cx = ev.clientX;
    let cy = ev.clientY;

    for (let draggable of workingDraggables)
        draggable.onMove(cx, cy);
})

const EMPTY_DRAG_IMAGE = ((function () {
    let image = document.createElement("img");
    image.src = "/assets/empty.png"

    return image;
})());

export class Draggable {
    constructor (element, stateCallback, moveCallback) {
        this.element = element;
        this.element.draggable = "true";

        this.moveCallback = moveCallback;
        this.lx = 0;
        this.ly = 0;
        
        this.element.addEventListener("dragstart", (event) => {
            this.lx = event.clientX;
            this.ly = event.clientY;

            workingDraggables.add(this);
            stateCallback(true);
            event.dataTransfer.setDragImage(EMPTY_DRAG_IMAGE, -99999, -99999);
        });
        this.element.addEventListener("dragend", (event) => {
            stateCallback(false);
            workingDraggables.delete(this);
        });
    }

    onMove (cx, cy) {
        let dx = cx - this.lx;
        let dy = cy - this.ly;

        this.moveCallback(dx, dy);

        this.lx = cx;
        this.ly = cy;
    }
}
