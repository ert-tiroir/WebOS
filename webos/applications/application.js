
/**********************************************************************************/
/* webos/applications/application.js                                              */
/*                                                                                */
/* This file contains the details for an abstract application.                    */
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

import { WindowRenderer } from "../renderers/window.js";

export class Application {
    constructor (os) {
        this.os = os;

        this.windows = new Map();
    }
    openWindow (window) {
        if (this.windows.get(window) !== undefined) this.closeWindow(window);

        let renderer = new WindowRenderer(this.os, window);
        this.windows.set(window, renderer);

        this.os.open(renderer);
    }
    closeWindow (window) {
        let renderer = this.windows.get(window);
        if (renderer === undefined) return ;
        
        this.windows.delete(window);
        this.os.close(renderer);
    }

    start () {}
    kill () {
        for (let window_renderer of this.windows) {
            let renderer = window_renderer[1];

            if (!renderer.opened) continue ;

            this.os.close(renderer);
        }

        this.windows.clear();
    }
}
