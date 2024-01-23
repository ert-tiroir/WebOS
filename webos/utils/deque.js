
/**
 * Circular queue with similar implementation to vectors
 */
export class Deque {
    constructor (size) {
        this.offset = 0;
        this.size   = 0;

        if (size <= 0) size = 1;

        this.max_size = 1 << Math.ceil(Math.log(size) / Math.LN2);

        this.data = new Array( this.max_size );
    }
    increase () {
        if (this.size != this.max_size) return ;

        this.max_size *= 2;
        let ndata = new Array( this.max_size );

        let first = true;
        for (let di = 0; di < this.size; di ++) {
            let i = this.offset + di;
            if (i >= this.size) i -= this.size;

            ndata[di] = this.data[i];
        }

        this.data   = ndata;
        this.offset = 0;
    }

    pushFront (object) {
        this.offset --;
        this.size   ++;
        if (this.offset == -1) this.offset += this.max_size;

        this.data[this.offset] = object;

        this.increase();
    }
    popFront () {
        if (this.size == 0) return undefined;

        this.size --;
        return this.data[this.offset ++];
    }
    getFront () {
        if (this.size == 0) return undefined;

        return this.data[this.offset];
    }

    pushBack (object) {
        let i = this.offset + this.size;
        if (i >= this.max_size) i -= this.max_size;

        this.size ++;
        this.data[i] = object;

        this.increase();
    }
    popBack () {
        if (this.size == 0) return undefined;

        let i = this.offset + this.size - 1;
        if (i >= this.max_size) i -= this.max_size;

        this.size --;

        return this.data[i];
    }
    getBack () {
        if (this.size == 0) return undefined;

        let i = this.offset + this.size - 1;
        if (i >= this.max_size) i -= this.max_size;

        return this.data[i];
    }
}
