
import { initSTL } from "./stdlib.js";
import { initUniSTD } from "./unistd.js";

const syscalls = {};

initSTL(syscalls)
initUniSTD(syscalls)

export function syscall (returns, program, id, name, args) {
    let val = syscalls[name](program, ...args);

    if (returns) {
        return {
            "answering": true,
            "target": id,
            "return_data": val
        }
    }

    return undefined;
}
