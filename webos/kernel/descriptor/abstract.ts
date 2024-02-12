
export class AbstractDescriptor {
    constructor () {}

    // size of the data to read
    read (_size: number): string | number { return -1; }
    // returns the amount of data available
    available () { return -1; }
    // write data to the descriptor
    write (_data: string) { return -1; }
}
