import { EXIT_SYSCALL } from "../consts.js";

function exit (program, ...args) {
    let code = args[0];

    program.terminate(code);
}

export function initSTL (syscalls) {
    syscalls[EXIT_SYSCALL] = exit;
}
