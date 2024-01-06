
/**********************************************************************************/
/* webos/applications/setup.js                                                    */
/*                                                                                */
/* This file contains the details for a simple loading screen application         */
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

import { Window, WindowRenderer } from "../renderers/window.js";
import { Application } from "./application.js";

class SetupWindow extends Window {
    constructor (os, app, image, name, subtext) {
        super(os);

        this.image   = image;
        this.name    = name;
        this.subtext = subtext;
        this.loadProxy()
    }

    getMinimalWidth  () { return this.getDefaultWidth(); }
    getDefaultWidth  () { return 250; }
    getMinimalHeight () { return this.getDefaultHeight(); }
    getDefaultHeight () { return 250; }

    _render () {
        let imageElement = createElement("div", {}, "h-[60%] w-full relative", [
            createElement("img", { src: this.image }, "w-25 h-25 rounded-100 acenter", [])
        ]);

        let textElement = createElement("div", {}, "h-[40%] w-full relative flex flex-col gap-3", [
            createElement("div", {}, "w-full text-center text-xl text-gray-200", [ createUnsafeText(this.name) ]),
            createElement("div", {}, "w-full text-center text-xs text-gray-200", [ createUnsafeText(this.subtext) ])
        ])

        return createElement("div", {}, "w-full h-full select-none", [
            imageElement,
            textElement
        ]);
    }
}

export class SetupApplication extends Application {
    constructor (os, image, name, subtext, setupEnded) {
        super(os);

        this.promise     = setupEnded;
        this.setupWindow = new SetupWindow(os, this, image, name, subtext);
        this.openWindow(this.setupWindow);

        this.then(() => this.kill());
    }
    setSubText (text) {
        this.setupWindow.text = text;
    }
    then (callback) {
        this.promise.then( callback );
    }
}
