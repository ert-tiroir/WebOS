import { createModules } from "../../modules/manager.js";
import { useWorkerConfig } from "../../../molyb/molyb/molyb.js";
import { Channel } from "../../../molyb/vdom/virtualdom/bridge/channels/channel.js";
import { Transceiver, WorkerTransceiver } from "../../../molyb/vdom/virtualdom/bridge/channels/transceiver.js";
import { AbstractModule } from "../../modules/abstract.js";

let syscallId = 0;

const callbacks: { [key: number]: (input: any) => void } = {};

const transceiver : Transceiver = new WorkerTransceiver();
const channel     : Channel     = new Channel("syscall", (syscall: string) => {
    let data      = JSON.parse(syscall);
    let answering = data.answering;
    if (!answering) return ;

    let id = data.target;

    let resolve = callbacks[id];
    delete callbacks[id];

    if (resolve === undefined) return ;

    resolve(JSON.parse(data.return_data));
});
transceiver.registerChannel(channel);

(globalThis as any).modules = createModules();

for (let moduleName in (globalThis as any).modules) {
    let module = (globalThis as any).modules[moduleName] as AbstractModule;

    (globalThis as any)[moduleName] = module;
    
    module.initChannel(transceiver);
}

useWorkerConfig( transceiver, "process.dom" );

export function syscall (name: number, returns: boolean, ...args: any[]): undefined | Promise<any> {
    syscallId ++;

    let data = [returns, syscallId, name, args];
    let str  = JSON.stringify(data);

    channel.postMessage(str);

    if (!returns) return undefined;

    let promise = new Promise((resolve, _) => {
        callbacks[syscallId] = resolve;
    })

    return promise;
}
