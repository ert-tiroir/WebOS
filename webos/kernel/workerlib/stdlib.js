
import { EXIT_SYSCALL, STDOUT } from "../consts.js";
import { syscall } from "./syscall.js";
import { write } from "./unistd.js";

export function exit (code = 0) {
    syscall(EXIT_SYSCALL, false, code);    

    // Do nothing until the worker is terminated
    while (true) {  }
}

export function printf (...args) {
    write(STDOUT, args.map((x) => {
        if (x instanceof String || typeof x === "string") return x;

        return JSON.stringify(x);
    }).join(" "));
}
