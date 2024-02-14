
import { EXIT_SYSCALL, LOAD_SYSCALL, STDOUT } from "../consts.js";
import { syscall } from "./syscall.js";
import { write } from "./unistd.js";

export function exit (code = 0) {
    syscall(EXIT_SYSCALL, false, code);    

    // Do nothing until the worker is terminated
    while (true) {  }
}

export function load (path: string) {
    return syscall(LOAD_SYSCALL, true, path);
}

export function printf (...args: any[]) {
    write(STDOUT, args.map((x) => {
        if (x instanceof String || typeof x === "string") return x;

        return JSON.stringify(x);
    }).join(" "));
}
