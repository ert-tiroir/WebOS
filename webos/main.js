
import { WebSocketClient } from "./api/client.js";
import { FileSystemProvider } from "./api/providers/filesystem/provider.js";
import { execute } from "./kernel/exec.js";
import { DEBUG, loggingConfig } from "./logging.js";

export function loadOS (webOSURL, osSeparator, ip) {
    let client = new WebSocketClient(ip);
    client.addProvider( new FileSystemProvider(client) );

    loggingConfig(DEBUG);

    execute(`//
    // The purpose of this app is to provide a pipe for which the input goes nowhere
    //
    // Somewhat equivalent to /dev/null
    //
    
    import { STDOUT } from "~/webos/kernel/consts.js";
    import { exit, printf } from "~/webos/kernel/workerlib/stdlib.js";
    import { write } from "~/webos/kernel/workerlib/unistd.js";
    
    (async () => {
            
        let res = await write( STDOUT, "Hi !" );
        console.log("Result: "); console.log(res);
        printf("How are you ?", { "target": "user" });
        exit(0);
    
    })();`)
}
