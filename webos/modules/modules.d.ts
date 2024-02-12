
import { DesktopModule } from "./desktop/desktop.js";
import { WindowModule } from "./window/module.js";
declare global {
    var desktop: DesktopModule;
    var windows: WindowModule;
}