import { Transceiver } from "../../molyb/vdom/virtualdom/bridge/channels/transceiver";
import { Channel } from "../../molyb/vdom/virtualdom/bridge/channels/channel.js";
import { Program } from "../kernel/program.js";

export type ModuleContract = { [key: string]: (...args: any[]) => any };
export type ModuleMessage  = { type: string, args: any[] };

export class ModuleExtension {}
export abstract class AbstractModule {
    private channel: Channel | undefined;

    constructor () {
        return new Proxy(this, {
            get: (target: AbstractModule, symbol: string | symbol, receiver) => {
                let result: any;
                if ((target as any)[symbol]) result = (target as any)[symbol];
                else result = (target.getContract() as any)[symbol];

                if (result !== undefined && (typeof result === "function" || result instanceof Function))
                    result = (result as Function).bind(receiver);
                return result;
            }
        })
    }

    initProgram (program: Program) {
        program.extensions[this.getName()] = this.createExtension();
    }
    initChannel (transceiver: Transceiver, ...supArgs: any[]): void {
        this.channel = new Channel(this.getName(), (data: string) => {
            let json     = JSON.parse(data) as ModuleMessage;
            let contract = this.getWorkerEquivalent();

            let callback = contract[json.type];
            if (callback === undefined) return ;

            callback(...supArgs, ...json.args);
        })

        transceiver.registerChannel(this.channel);

        if (globalThis.document !== undefined) this.channel = undefined;
    };

    abstract init    (): void;
    abstract destroy (): void;

    abstract getName (): string;

    call (type: string, ...args: any[]) {
        if (globalThis.document !== undefined) throw "Can only call contract in other context when inside a worker";
        if (this.channel        === undefined) return ;

        let message: ModuleMessage = { type, args };
        this.channel.postMessage( message );
    }
    getContract(): ModuleContract {
        if (globalThis.document === undefined) return this.getWorkerContract();

        return this.getGlobalContract();
    }

    abstract getWorkerContract   (): ModuleContract;
    abstract getWorkerEquivalent (): ModuleContract;
    abstract getGlobalContract   (): ModuleContract;

    abstract createExtension (): ModuleExtension;
};
