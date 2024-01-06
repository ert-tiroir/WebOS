
/**********************************************************************************/
/* webos/renderers/background.js                                                  */
/*                                                                                */
/* This file contains the details for the desktop background renderer             */
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

import { ElementRenderer } from "./renderer.js";

export class BackgroundComponent extends Component {
    constructor (parent, target) {
        super(parent);
        this.target = target;

        this.loadProxy();
    }
    _render () {
        let element = createElement("div", {}, "w-[100vw] h-[100vh] left-0 top-0 absolute", []);
        element.style.background = "url(" + this.target + ")";
        element.style.backgroundSize = "cover";

        return element;
    }
}

export class BackgroundRenderer extends ElementRenderer {
    constructor (os, background) {
        let component;
        super(os, component = new BackgroundComponent(undefined, background));
    
        this.backgroundComponent = component;
    }

    setBackground (background) {
        this.backgroundComponent.target = background;
    }
}
