
import { READ_SYSCALL, WRITE_SYSCALL } from "../consts.js";
import { Program } from "../program.js";

export function read (program: Program, desc_id: number, size: number) {
    let desc = program.descriptors[desc_id];
    if (desc === undefined) return -1;

    return desc.read(size);
}
export function write (program: Program, desc_id: number, data: string) {
    let desc = program.descriptors[desc_id];
    if (desc === undefined) return -1;

    return desc.write(data);
}

export function initUniSTD (syscalls: { [key: number]: (program: Program, ...args: any[]) => any }) {
    syscalls[READ_SYSCALL]  = read;
    syscalls[WRITE_SYSCALL] = write;
}
