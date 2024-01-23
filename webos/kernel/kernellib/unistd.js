
import { READ_SYSCALL, WRITE_SYSCALL } from "../consts.js";

export function read (program, desc_id, size) {
    let desc = program.descriptors[desc_id];
    if (desc === undefined) return -1;

    return desc.read(size);
}
export function write (program, desc_id, data) {
    let desc = program.descriptors[desc_id];
    if (desc === undefined) return -1;

    return desc.write(data);
}

export function initUniSTD (syscalls) {
    syscalls[READ_SYSCALL]  = read;
    syscalls[WRITE_SYSCALL] = write;
}
