
export class FileTreeNode {
    constructor (relpath, name, isFile, isDirectory) {
        this.relpath = relpath;
        this.name    = name;

        this.isFile      = isFile;
        this.isDirectory = isDirectory;
    
        this.subfiles = {};
    }
    addSubFile (file) {
        this.subfiles[file.name] = file;
    }
}

export class FileTree {
    constructor (separator = "/") {
        this.root = undefined;
        this.sep  = separator;
    }

    getFileInNode (node, names, offset) {
        if (node == undefined || offset == names.length) return node;
        
        let next = names[offset] == "" ? node : node.subfiles[names[offset]]
        return this.getFileInNode(next, names, offset + 1);
    }
    getDirectoryAndName (relpath) {
        let paths = relpath.split(this.sep)
        
        let name = paths[paths.length - 1];
        paths.splice(paths.length - 1, 1);
        return [this.getFile(paths.join(this.sep)), name];
    }
    getFile (relpath) {
        if (relpath.startsWith(this.sep))
            relpath = relpath.substring(this.sep.length);

        return this.getFileInNode(this.root, relpath.split(this.sep), 0);
    }

    popFile (relpath) {
        let [dir, name] = this.getDirectoryAndName(relpath);
        console.log(dir, name)
        if (dir === undefined || name === undefined) return undefined;

        let file = dir.subfiles[name];
        dir.subfiles[name] = undefined;
        return file;
    }
    pushFile (relpath, file) {
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

    moveFile (src, dest) {
        let file = this.popFile(src);
        if (file === undefined) return ;

        this.pushFile(dest);
    }
}
