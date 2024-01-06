
/**********************************************************************************/
/* example.js                                                                     */
/*                                                                                */
/* This file contains a simple example using WebOS                                */
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

import { SetupApplication } from "./webos/applications/setup.js";
import { OperatingSystem } from "./webos/os.js";
import { BackgroundRenderer } from "./webos/renderers/background.js";
import { ElementRenderer } from "./webos/renderers/renderer.js";
import { GlassTheme } from "./webos/themes/glass.js";

let os = new OperatingSystem("EPFL Rocket Team - Nordli", new GlassTheme());
let bg = new BackgroundRenderer(os, "/assets/example/interface_background.png");
os.open(bg);

let ap = new SetupApplication(os, "/assets/example/ert_icon.png", "EPFL Rocket Team<br>Space Race IV - Nordli", "Setting up workspace...",
    new Promise((resolve, reject) => {
        setTimeout(() => resolve(), 2000)
    })
);
os.startApplication(ap);
