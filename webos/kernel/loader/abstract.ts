import { LoaderContext } from "./context.js";

export abstract class AbstractLoader {
    abstract compile (mainLoader: AbstractLoader, context: LoaderContext, path: string): Promise<string | null>;
}
