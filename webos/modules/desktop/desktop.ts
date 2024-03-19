
import { Program } from "../../kernel/program.js";
import { AbstractModule, ModuleExtension } from "../abstract.js";

export class DesktopModule extends AbstractModule {
    component: HTMLElement;
    source   : string;

    init (): void {
        this.component = document.createElement("div");
        document.body.appendChild(this.component);

        this.component.className = "absolute w-full h-full bg-cover bg-center";
    }
    destroy (): void {
        document.body.removeChild(this.component);
    }

    getWorkerContract() {
        return {
            setBackground: (source: string) => {
                this.call("setBackground", source);
            }
        };
    }
    getWorkerEquivalent() {
        return {
            setBackground: (_: Program, source: string) => {
                this.getGlobalContract().setBackground (source);
            }
        };
    }
    getGlobalContract() {
        return {
            setBackground: (source: string) => {
                this.component.style.backgroundImage = `url(${source})`;

                this.source = source;
            }
        };
    }

    createExtension(_program: Program): ModuleExtension {
        return new ModuleExtension();
    }
    getName(): string {
        return "desktop";
    }
}
