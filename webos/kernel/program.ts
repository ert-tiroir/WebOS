import { ModuleExtension } from "../modules/abstract.js";
import { DOMMutationPatcher } from "../../molyb/vdom/virtualdom/mutations/patch/dom.js";
import { STDERR, STDIN, STDOUT } from "./consts.js";
import { AbstractDescriptor } from "./descriptor/abstract.js";

export class Program {
    worker: Worker;
    running: boolean;
    code:    number;
    
    descriptors: { [key: number]: AbstractDescriptor };
    body: Node;
    patcher: DOMMutationPatcher;
    extensions: { [key: string]: ModuleExtension };
    constructor (worker: Worker) {
        this.worker = worker;

        this.running = true;
        this.code    = 0;

        this.descriptors = {};
        this.extensions  = {};

        this.body = document.body;
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
