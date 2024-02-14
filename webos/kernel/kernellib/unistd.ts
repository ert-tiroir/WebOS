
import { OPEN_SYSCALL, READ_SYSCALL, WRITE_SYSCALL } from "../consts.js";
import { BufferDescriptor } from "../descriptor/buffer.js";
import { ReadOnlyDescriptor } from "../descriptor/reference.js";
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
export async function open (program: Program, path: string, mode: "r") {
    if (mode === "r") {
        await fileSystem.waitForLoad();
    
        let data = await fileSystem.readFile(path);
        if (data === null) return -1;

        let buff = new BufferDescriptor(); buff.write(data);
        let desc = new ReadOnlyDescriptor(buff);

        return program.addDescriptor(desc);
    }

    return -1;
}

export function initUniSTD (syscalls: { [key: number]: (program: Program, ...args: any[]) => any }) {
    syscalls[READ_SYSCALL]  = read;
    syscalls[OPEN_SYSCALL]  = open;
    syscalls[WRITE_SYSCALL] = write;
}
