import { STDERR, STDIN, STDOUT } from "./consts.js";

export class Program {
    constructor (worker) {
        this.worker = worker;

        this.running = true;
        this.code    = 0;

        this.descriptors = {}
    }
    
    setStandardOutput (desc) {
        this.descriptors[STDOUT] = desc;
    }
    setStandardError (desc) {
        this.descriptors[STDERR] = desc;
    }
    setStandardInput (desc) {
        this.descriptors[STDIN] = desc;
    }

    terminate (code = 0) {
        this.code = code;
        
        this.running = false;
        this.worker.terminate();
    }
}
