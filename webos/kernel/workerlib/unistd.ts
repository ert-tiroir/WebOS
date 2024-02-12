
import { READ_SYSCALL, WRITE_SYSCALL } from "../consts.js";
import { syscall } from "./syscall.js";

export function read (desc_id: number, size: number) {
    return syscall( READ_SYSCALL, true, desc_id, size );
}
export function write (desc_id: number, data: string) {
    return syscall( WRITE_SYSCALL, true, desc_id, data );
}