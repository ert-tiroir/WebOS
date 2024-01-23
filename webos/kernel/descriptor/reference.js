import { AbstractDescriptor } from "./abstract.js";

export class ReadOnlyDescriptor extends AbstractDescriptor {
    constructor (desc) {
        super();
        this.desc = desc;
    }

    read (size) {
        return this.desc.read(size);
    }
    available () {
        return this.desc.available();
    }
    write (data) {
        return -1;
    }
}

export class WriteOnlyDescriptor extends AbstractDescriptor {
    constructor (desc) {
        super();
        this.desc = desc;
    }

    read (size) { return -1; }
    available () { return 0; }

    write (data) {
        return this.desc.write(data);
    }
}
