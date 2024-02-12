import { EXIT_SYSCALL } from "../consts.js";
import { Program } from "../program.js";

function exit (program: Program, ...args: any []) {
    let code = args[0];

    program.terminate(code);
}

export function initSTL (syscalls: { [key: number]: (program: Program, ...args: any[]) => any }) {
    syscalls[EXIT_SYSCALL] = exit;
}
