import { FileSystemProvider } from "./providers/filesystem/provider.js";

declare global {
    var fileSystem: FileSystemProvider;
}
