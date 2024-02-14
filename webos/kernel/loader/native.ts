import { AbstractLoader } from "./abstract.js";
import { LoaderContext } from "./context.js";

export class NativePathLoader extends AbstractLoader {
    libPath: string;
    constructor (libPath: string) {
        super();

        this.libPath = libPath;
    }

    compile(_loader: AbstractLoader, _context: LoaderContext, path: string): Promise<string | null> {
        if (!path.startsWith("~")) return new Promise((resolve, _2) => resolve(null));
        
        return new Promise((resolve, _) => resolve(this.libPath + path.substring(1)));
    }
}
