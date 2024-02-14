
import { WebSocketClient } from "./api/client.js";
import { FileSystemProvider } from "./api/providers/filesystem/provider.js";
import { execute } from "./kernel/exec.js";
import { LoaderContext } from "./kernel/loader/context.js";
import { Loader } from "./kernel/loader/manager.js";
import { DEBUG, loggingConfig } from "./logging.js";
import { createModules } from "./modules/manager.js";

export async function loadOS (_webOSURL: string, _osSeparator: string, ip: string) {
    let client = new WebSocketClient(ip);
    globalThis.fileSystem = new FileSystemProvider(client);
    client.addProvider( globalThis.fileSystem );

    (window as any).webOSClient = client;

    (window as any).modules = createModules();

    for (let moduleName in (window as any).modules) {
        let module = (window as any).modules[moduleName];

        (globalThis as any)[moduleName] = module;

        (module as any).init();
    }

    loggingConfig(DEBUG);

    await fileSystem.waitForLoad();

    execute(new Loader(document.location.origin + "/lib"), new LoaderContext(...[ "" ]), "boot.js");
    //let loader = new Loader(document.location.origin + "/lib");
    //let ctx    = new LoaderContext(...[ "/user/bin" ]);
    //execute(loader, ctx, "null.js");

    /**execute(`//
    // The purpose of this app is to provide a pipe for which the input goes nowhere
    //
    // Somewhat equivalent to /dev/null
    //
    
    import { STDOUT } from "~/webos/kernel/consts.js";
    import { exit, printf } from "~/webos/kernel/workerlib/stdlib.js";
    import { write } from "~/webos/kernel/workerlib/unistd.js";
    import { Molyb } from "~/molyb/molyb/molyb.js";
    import { Component } from "~/molyb/molyb/component.js";

    import { Window } from "~/webos/modules/window/window.js";

    class C extends Component {
        constructor (text) {
            super();
            this.text = text;
        }
        init () {}
        update () {
            return <div>{ this.text }</div>;
        }
    }
    
    let window = new Window(new C("win1"), { width: 500, height: 500, minWidth: 100, minHeight: 100, maxWidth: 900, maxHeight: 900 });
    window.open();
    window = new Window(new C("win2"), { width: 500, height: 500, minWidth: 100, minHeight: 100, maxWidth: 900, maxHeight: 900 });
    window.open();

    (async () => {
        let res = await write( STDOUT, "Hi !" );
        printf("How are you ?", { "target": "user" });
        
        let h = <div>Hi !</div>;
        Molyb.document.appendChild(h);

        modules.desktop.setBackground("/assets/example/interface_background.png");
        
        //setTimeout(() => exit(0), 1000);
    })();`, "<input>");*/
}
