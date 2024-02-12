import { AbstractDescriptor } from "./abstract.js";

export class ReadOnlyDescriptor extends AbstractDescriptor {
    desc: AbstractDescriptor;

    constructor (desc: AbstractDescriptor) {
        super();
        this.desc = desc;
    }

    read (size: number): string | number {
        return this.desc.read(size);
    }
    available () {
        return this.desc.available();
    }
    write (_data: string) {
        return -1;
    }
}

export class WriteOnlyDescriptor extends AbstractDescriptor {
    desc: AbstractDescriptor;

    constructor (desc: AbstractDescriptor) {
        super();
        this.desc = desc;
    }

    read (_size: number): string | number { return -1; }
    available () { return 0; }

    write (data: string) {
        return this.desc.write(data);
    }
}
