
import { Deque } from "../../utils/deque.js";
import { AbstractDescriptor } from "./abstract.js";

export class BufferDescriptor extends AbstractDescriptor {
    buffer: Deque;
    
    constructor () {
        super();
        this.buffer = new Deque(0);
    }

    read (size: number): string | number {
        let result = [];

        for (let i = 0; i < size && this.buffer.size != 0; i ++)
            result.push(this.buffer.popFront());
    
        return result.join("");
    }
    available () {
        return this.buffer.size;
    }
    write (data: string) {
        for (let chr of data)
            this.buffer.pushBack(chr);

        return 0;
    }
}
