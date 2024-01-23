
import { Deque } from "../../../webos/utils/deque.js";
import { AbstractDescriptor } from "./abstract.js";

export class BufferDescriptor extends AbstractDescriptor {
    constructor () {
        super();
        this.buffer = new Deque(0);
    }

    read (size) {
        let result = [];

        for (let i = 0; i < size && this.buffer.size != 0; i ++)
            result.push(this.buffer.popFront());
    
        return result.join("");
    }
    available () {
        return this.buffer.size;
    }
    write (data) {
        console.log(data)
        for (let chr of data)
            this.buffer.pushBack(chr);

        return 0;
    }
}
