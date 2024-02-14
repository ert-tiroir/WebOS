import { ModuleExtension } from "../modules/abstract.js";
import { DOMMutationPatcher } from "../../molyb/vdom/virtualdom/mutations/patch/dom.js";
import { STDERR, STDIN, STDOUT } from "./consts.js";
import { AbstractDescriptor } from "./descriptor/abstract.js";
import { Loader } from "./loader/manager.js";
import { LoaderContext } from "./loader/context.js";

export class Program {
    worker: Worker;
    running: boolean;
    code:    number;
    
    descriptors: { [key: number]: AbstractDescriptor };
    descId: number;
    body: Node;
    patcher: DOMMutationPatcher;
    extensions: { [key: string]: ModuleExtension };
    loader:  Loader;
    context: LoaderContext;
    constructor (worker: Worker) {
        this.worker = worker;

        this.running = true;
        this.code    = 0;

        this.descId = 4;

        this.descriptors = {};
        this.extensions  = {};

        this.body = document.body;
    }
    addDescriptor (desc: AbstractDescriptor): number {
        let id = this.descId ++;
        this.descriptors[id] = desc;
        return id;
    }
    getExtension (key: string): ModuleExtension | undefined {
        return this.extensions[key];
    }
    
    setStandardOutput (desc: AbstractDescriptor) {
        this.descriptors[STDOUT] = desc;
    }
    setStandardError (desc: AbstractDescriptor) {
        this.descriptors[STDERR] = desc;
    }
    setStandardInput (desc: AbstractDescriptor) {
        this.descriptors[STDIN] = desc;
    }

    terminate (code = 0) {
        this.code = code;
        
        this.running = false;
        this.worker.terminate();

        for (let key in this.patcher.nodes) {
            let node = this.patcher.nodes[key];
            if (node === undefined || node === this.body) continue;

            node.parentNode?.removeChild(node);
        }
    }
}
