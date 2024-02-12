
import { AbstractModule } from "./abstract.js";
import { DesktopModule } from "./desktop/desktop.js";
import { WindowModule } from "./window/module.js";

export function createModules (): { [key: string]: AbstractModule } {
    return {
        "desktop": new DesktopModule(),
        "windows": new WindowModule ()
    }
}
