
/**********************************************************************************/
/* webos/themes/glass.js                                                          */
/*                                                                                */
/* This file contains the details for a Glassmorphic theme                        */
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

import { AbstractTheme } from "./abstract.js";

export class GlassTheme extends AbstractTheme {
    constructor () { super(); }

    createWindowContainer (props, classes, childrens) {
        classes += " absolute rounded-20 bg-white";

        // https://dev.to/afif/border-with-gradient-and-radius-387f
        // let border = createElement("div", {}, "rounded-20 w-[calc(100%_-_4px)] h-[calc(100%_-_4px)] absolute left-0 top-0", childrens);
        // border.style.border              = "2px solid transparent";
        // border.style.background          = "linear-gradient(45deg, rgba(180, 180, 180, 0.0), rgba(180, 180, 180, 0.6)) border-box";
        // border.style.webkitMask          = "linear-gradient(#fff 0 0) padding-box, \nlinear-gradient(#fff 0 0)";
        // border.style.webkitMaskComposite = "xor";
        // border.style.maskComposite       = "exclude";

        let box = createElement("div", {}, "rounded-20 w-full h-full relative", [ 
            createElement("div", {}, "rounded-20 relative w-full h-full overflow-hidden p-[2px]", childrens) ])

        let element = createElement("div", props, classes, [ box ]);

        element.style.backgroundColor = "rgba(217, 217, 217, 0.2)";
        element.style.backdropFilter  = "blur(20px)";

        return element;
    }
}
