import { EXIT_SYSCALL, LOAD_SYSCALL } from "../consts.js";
import { Program } from "../program.js";

function exit (program: Program, ...args: any []) {
    let code = args[0];

    program.terminate(code);
}

async function load (program: Program, path: string) {
    return await program.loader.compile(program.loader, program.context, path);
}

export function initSTL (syscalls: { [key: number]: (program: Program, ...args: any[]) => any }) {
    syscalls[EXIT_SYSCALL] = exit;
    syscalls[LOAD_SYSCALL] = load;
}
