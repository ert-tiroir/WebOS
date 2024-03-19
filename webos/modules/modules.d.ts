
import { DesktopModule } from "./desktop/desktop.js";
import { NavbarModule } from "./navbar/module.js";
import { WindowModule } from "./window/module.js";
declare global {
    var desktop: DesktopModule;
    var windows: WindowModule;
    var navbar:  NavbarModule;
}