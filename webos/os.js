
/**********************************************************************************/
/* webos/os.js                                                                    */
/*                                                                                */
/* This file contains an abstract operating system, with renderers and            */
/* applications                                                                   */
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

import { Listener } from "./callback.js";

export const EVENT_OPEN_RENDERER  = "os.renderer.open";
export const EVENT_CLOSE_RENDERER = "os.renderer.close";

export class OperatingSystem extends Listener {
    constructor (name, theme) {
        super();
        this.name  = name;
        this.theme = theme;
    
        this.renderers    = [];
        this.applications = new Set();
    }
    startApplication (application) {
        this.applications.add(application);
        application.start();
    }
    killApplication (application) {
        this.applications.delete(application);
        application.kill();
    }
    getTheme () {
        return this.theme;
    }

    updateDepth () {
        for (let id in this.renderers)
            this.renderers[id].useDepth(id);
    }

    getIndex (renderer) {
        return this.renderers.indexOf(renderer);
    }
    putOnTop (renderer) {
        if (this.getIndex(renderer) == -1) return ;

        this.close(renderer, false);
        this.open (renderer, false);
    }
    open (renderer, triggerEvent = true) {
        let index = this.getIndex(renderer);
        if (index != -1) return ;

        this.renderers.push(renderer);
        renderer.open();

        if (triggerEvent) this.trigger(EVENT_OPEN_RENDERER, renderer);
    }
    close (renderer, triggerEvent = true) {
        let index = this.getIndex(renderer);
        if (index == -1) return ;
    
        this.renderers.splice(index, 1);
        renderer.close();

        if (triggerEvent) this.trigger(EVENT_CLOSE_RENDERER, renderer);
    }
}
