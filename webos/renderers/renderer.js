
/**********************************************************************************/
/* webos/renderers/renderer.js                                                    */
/*                                                                                */
/* This file contains the details for an abstract renderer and a Molyb component  */
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

export class AbstractRenderer {
    constructor (os) {
        this.os = os;
    }
    getOperatingSystem () {
        return this.os;
    }

    useDepth (depth) {}
    
    open  () {}
    close () {}
}

export class ElementRenderer extends AbstractRenderer {
    constructor (os, component) {
        super(os);

        this.component = component;

        this.component.parent = this;
        
        this.opened = false;

        this.depth = -1;
    }

    useDepth (depth) {
        this.depth = depth;

        if (this.element) this.element.style.zIndex = this.depth;
    }

    render () {
        return this.component.render();
    }
    updateChild (child, newComponent, oldComponent) {
        this.element = newComponent;
        this.element.style.zIndex = this.depth;

        if (this.opened)
            document.body.replaceChild(newComponent, oldComponent);
    }

    open () {
        if (this.opened) return ;
        this.opened = true;

        this.element = this.render();
        this.element.style.zIndex = this.depth;
        document.body.appendChild(this.element);
    }
    close () {
        if (!this.opened) return ;
        this.opened = false;

        document.body.removeChild(this.element)
    }
}
