
export class LoaderContext {
    readonly path   : readonly string[];
    readonly loaded : { [key: string]: string } = {};

    constructor (...path: string[]) {
        this.path = path;
    }
}
