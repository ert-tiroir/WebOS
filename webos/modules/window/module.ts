import { DocumentType } from "../../../molyb/vdom/virtualdom/virtual/document.js";
import { AbstractModule, ModuleExtension } from "../abstract.js";
import { Node as VNode } from "../../../molyb/vdom/virtualdom/virtual/tree/node.js";
import { Program } from "../../kernel/program.js";
import { WINDOW_MANAGER } from "./manager.js";
import { WindowProps } from "./window.js";

export class WindowExtension extends ModuleExtension {
    windows: { [key: number]: [ Node, number ] };

    constructor () {
        super();

        this.windows = {  };
    }
}

export class WindowModule extends AbstractModule {
    init():    void {}
    destroy(): void {}
    getName(): string {
        return "windows";
    }
    getWorkerContract() {
        return { 
            registerWindow: (
                    component: VNode<number, DocumentType<number>>,
                    props:     WindowProps,
                    ...movers: [VNode<number, DocumentType<number>>, number][]) => {
                let nodeID = component.index;

                let nmv = movers.map((value) => [ value[0].index, value[1] ]) as [number, number][];

                setTimeout(() => { this.call("registerWindow", nodeID, props, ...nmv) }, 0);
            }
        };
    }
    getWorkerEquivalent() {
        return {
            registerWindow: (program: Program, nodeID: number, props: WindowProps, ...movers: [ number, number ][]) => {
                let extension = this.getExtension(program);
                let window    = program.patcher.nodes[nodeID] as HTMLElement;
                if (window === undefined) return ;

                let nmv = movers.map((value) => [program.patcher.nodes[value[0]], value[1]]) as [HTMLElement, number][];

                let idx = WINDOW_MANAGER.registerWindow(window, props, nmv);

                extension.windows[nodeID] = [ window, idx ];
            }
        };
    }
    getGlobalContract() {
        return {  };
    }

    getExtension (program: Program) {
        return program.getExtension(this.getName()) as WindowExtension;
    }
    createExtension(_program: Program): ModuleExtension {
        return new WindowExtension();
    }

}
