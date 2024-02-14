import { getLogger } from "../../logging.js";
import { loadScript } from "../exec.js";
import { AbstractLoader } from "./abstract.js";
import { LoaderContext } from "./context.js";



export class FileSystemLoader extends AbstractLoader {
    toPath (path: string, paths: readonly string[]): string | null {
        if (path.startsWith("/")) return path;

        for (let relpath of paths){
            let abspath = relpath;
            if (!abspath.endsWith("/")) abspath += "/";
            
            abspath += path;

            let file = fileSystem.tree.getFile(abspath);
            if (file === undefined) continue ;
            if (file.isDirectory) continue ;
            if (!file.isFile) continue ;

            return abspath;
        }
        
        return null;
    }
    compile(loader: AbstractLoader, context: LoaderContext, path: string): Promise<string | null> {
        const finalPath = this.toPath(path, context.path);
        if (finalPath === null) return new Promise((_1, _2) => _1(null));

        if (context.loaded[finalPath])
            return new Promise((_1, _2) => _1(context.loaded[finalPath] as string));

        return new Promise(async (resolve, _2) => {
            let content = await fileSystem.readFile(finalPath);
            if (content === null) {
                getLogger("Loader").critical("Could not load script at path " + path);
                throw "Could not load script at path " + path;
            }

            let url = await loadScript((path: string) => loader.compile(loader, context, path), content);
            context.loaded[finalPath] = url;
            resolve(url);
        });
    }
}
