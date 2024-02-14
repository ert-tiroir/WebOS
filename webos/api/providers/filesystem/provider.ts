import { WebSocketClient } from "webos/api/client.js";
import { getLogger } from "../../../logging.js";
import { AbstractProvider } from "../abstract.js";
import { FileTree, FileTreeNode } from "./filetree.js";
import { Message } from "webos/api/message.js";

const logger = getLogger("FileSystem");

export class FileSystemProvider extends AbstractProvider {
    tree: FileTree;

    promises: ((...args: any) => void)[];

    constructor (client: WebSocketClient) {
        super(client);

        this.promises = [];
    }
    getProviderName () {
        return "filesystem";
    }

    readFile (path: string): Promise<string | null> {
        return new Promise<string | null> ((resolve, _) => {
            this.client.send(this.getProviderName(), { type: "read", path: path }, (message) => {
                resolve(atob(message.data.data));
                
                return false;
            })
        })
    }
    
    waitForLoad (): Promise<void> | void {
        if (this.tree !== null && this.tree !== undefined) return ;
        return new Promise((resolve, _) => this.promises.push(resolve));
    }
    onload () {
        this.tree = new FileTree();
    }
    onmessage (message: Message) {
        if (message?.data?.patch === undefined) return ;

        for (let data of message.data.patch) {
            if (data.mode == "create") {
                let path = data.path;

                let file = new FileTreeNode(path, "", false, false);
                this.tree.pushFile(path, file)
            }
            if (data.mode == "params") {
                let file = this.tree.getFile(data.path);

                if (file === undefined) {
                    logger.critical("Could not find file for modification")

                    continue ;
                }

                file.isFile      = data.is_file;
                file.isDirectory = data.is_directory;
            }
            if (data.mode == "delete")
                this.tree.popFile(data.path);
            if (data.mode == "move") {
                let file = this.tree.popFile( data.source );

                if (file === undefined) {
                    logger.critical("Could not move the file in the file system")

                    continue ;
                }

                this.tree.pushFile( data.destination, file );
            }
        }
    
        for (let promise of this.promises) promise();
        this.promises = [];
    }
}
