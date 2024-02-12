
import { Program } from "../program.js";
import { initSTL } from "./stdlib.js";
import { initUniSTD } from "./unistd.js";

const syscalls: { [key: number]: (program: Program, ...args: any[]) => any } = {};

initSTL    (syscalls);
initUniSTD (syscalls);

export function syscall (returns: boolean, program: Program, id: number, name: number, args: any[]) {
    let val = (syscalls[name] as any)(program, ...args);

    if (returns) {
        return {
            "answering": true,
            "target": id,
            "return_data": val
        }
    }

    return undefined;
}
