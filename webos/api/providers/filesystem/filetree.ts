
export class FileTreeNode {
    relpath: string;
    name   : string;

    isFile     : boolean;
    isDirectory: boolean;

    subfiles: { [name: string]: FileTreeNode | undefined };

    constructor (relpath: string, name: string, isFile: boolean, isDirectory: boolean) {
        this.relpath = relpath;
        this.name    = name;

        this.isFile      = isFile;
        this.isDirectory = isDirectory;
    
        this.subfiles = {};
    }
    addSubFile (file: FileTreeNode) {
        this.subfiles[file.name] = file;
    }
}

export class FileTree {
    root: FileTreeNode | undefined;
    sep : string;
    constructor (separator = "/") {
        this.root = undefined;
        this.sep  = separator;
    }

    getFileInNode (node: FileTreeNode | undefined, names: string[], offset: number): FileTreeNode | undefined {
        if (node == undefined || offset == names.length) return node;
        
        let name = names[offset];
        if (name === undefined) return undefined;

        let next = names[offset] == "" ? node : node.subfiles[name]
        return this.getFileInNode(next, names, offset + 1);
    }
    getDirectoryAndName (relpath: string): [ FileTreeNode | undefined, string ] {
        let paths = relpath.split(this.sep)
        
        let name = paths[paths.length - 1] as string;
        paths.splice(paths.length - 1, 1);

        return [this.getFile(paths.join(this.sep)), name];
    }
    getFile (relpath: string): FileTreeNode | undefined {
        if (relpath.startsWith(this.sep))
            relpath = relpath.substring(this.sep.length);

        return this.getFileInNode(this.root, relpath.split(this.sep), 0);
    }

    popFile (relpath: string): FileTreeNode | undefined {
        let [dir, name] = this.getDirectoryAndName(relpath);
        console.log(dir, name)
        if (dir === undefined || name === undefined) return undefined;

        let file = dir.subfiles[name];
        dir.subfiles[name] = undefined;
        return file;
    }
    pushFile (relpath: string, file: FileTreeNode) {
        if (relpath == this.sep) {
            this.root = file;
            file.relpath = this.sep;
            file.name    = "";
            return ;
        }
        let [dir, name] = this.getDirectoryAndName(relpath);
        if (dir === undefined || name === undefined) return ;

        dir.subfiles[name] = file;
        file.relpath = relpath;
        file.name    = name;
    }

    moveFile (src: string, dest: string) {
        let file = this.popFile(src);
        if (file === undefined) return ;

        this.pushFile(dest, file);
    }
}
