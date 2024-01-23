
export class AbstractDescriptor {
    constructor () {}

    // size of the data to read
    read (size) { return -1; }
    // returns the amount of data available
    available () { return -1; }
    // write data to the descriptor
    write (data) { return -1; }
}
