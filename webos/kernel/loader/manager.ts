import { AbstractLoader } from "./abstract.js";
import { LoaderContext } from "./context.js";
import { FileSystemLoader } from "./filesystem.js";
import { NativePathLoader } from "./native.js";

export class Loader extends AbstractLoader {
    loaders: AbstractLoader[];

    constructor (webOSPath: string) {
        super()
        this.loaders = [
            new NativePathLoader(webOSPath),
            new FileSystemLoader()
        ];
    }

    compile(mL: AbstractLoader, context: LoaderContext, path: string): Promise<string | null> {
        return new Promise(async (resolve, _) => {
            for (let loader of this.loaders) {
                let result = await loader.compile(mL, context, path);
                
                if (result === null) continue ;
                resolve(result);
                return ;
            }

            resolve(null);
        })
    }
}
