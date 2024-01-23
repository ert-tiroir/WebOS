
import { READ_SYSCALL, WRITE_SYSCALL } from "../consts.js";
import { syscall } from "./syscall.js";

export function read (desc_id, size) {
    return syscall( READ_SYSCALL, true, desc_id, size );
}
export function write (desc_id, data) {
    return syscall( WRITE_SYSCALL, true, desc_id, data );
}
