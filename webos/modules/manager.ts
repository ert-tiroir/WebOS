
import { AbstractModule } from "./abstract.js";
import { DesktopModule } from "./desktop/desktop.js";
import { NavbarModule } from "./navbar/module.js";
import { WindowModule } from "./window/module.js";

export function createModules (): { [key: string]: AbstractModule } {
    return {
        "desktop": new DesktopModule(),
        "windows": new WindowModule (),
        "navbar" : new NavbarModule ()
    }
}
