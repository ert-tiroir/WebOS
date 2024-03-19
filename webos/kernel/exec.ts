import { DOMMutationPatcher } from "../../molyb/vdom/virtualdom/mutations/patch/dom.js";
import { Channel } from "../../molyb/vdom/virtualdom/bridge/channels/channel.js";
import { WindowTransceiver } from "../../molyb/vdom/virtualdom/bridge/channels/transceiver.js";
import { BufferDescriptor } from "./descriptor/buffer.js";
import { ReadOnlyDescriptor, WriteOnlyDescriptor } from "./descriptor/reference.js";
import { syscall } from "./kernellib/syscall.js";
import { Program } from "./program.js";
import { WorkerDOMBridge } from "../../molyb/vdom/virtualdom/bridge/worker.js";
import { DOMSubscribable } from "../../molyb/vdom/virtualdom/events/dom.js";
import { AbstractModule } from "../modules/abstract.js";
import { getLogger } from "../logging.js";
import { Loader } from "./loader/manager.js";
import { LoaderContext } from "./loader/context.js";

function getAbstractSyntaxTree (code: string) {
    // @ts-ignore
    return Babel.transform(code, { 
        ast: true, 
        plugins: [
            [ "transform-react-jsx", { "pragma": "Molyb.createElement" } ]
        ]
    }).ast;
}

function codeFromAbstractSyntaxTree (ast: any) {
    // @ts-ignore
    return Babel.transformFromAst(ast, "", {});
}

async function traverseAST (ast: any, callback: (node: any) => any) {
    async function dfs (node: any) {
        if (node.body !== undefined) {
            let target = node;
            while (target.body?.body) target = target.body;
            
            let nbody = [];
            for (let next of target.body)
                nbody.push(await dfs(next));
            
            target.body = nbody;
        }

        node = await callback(node);

        return node;
    }

    ast.program = await dfs(ast.program);
    return ast;
}

async function bindImports (loader: (path: string) => Promise<string | null>, script: string) {
    const ast = getAbstractSyntaxTree(script);
    
    await traverseAST(ast, async (node) => {
        if (node.type === "ImportDeclaration") {
            let target = node.source.value;

            let loaded = await loader(target);

            node.source.value = loaded;
        }

        return node;
    })

    return codeFromAbstractSyntaxTree(ast).code;
}

export async function loadScript (loader: (path: string) => Promise<string | null>, script: string) {
    script = await bindImports(loader, script);
    
    let blob = new Blob([ script ], {
        type: "application/js"
    })
    let url = URL.createObjectURL(blob);

    return url;
}
export async function execute (loader: Loader, context: LoaderContext, path: string) {
    let url = await loader.compile(loader, context, path);
    if (url == null) {
        getLogger("Execute").critical("Could not compile and execute path " + path);
        return ;
    }

    let worker = new Worker(url, { type: "module" });
    let prog   = new Program(worker);
    
    prog.loader  = loader;
    prog.context = context;

    let stdout = new BufferDescriptor();
    let stderr = new BufferDescriptor();
    let stdin  = new BufferDescriptor();

    prog.setStandardOutput( new WriteOnlyDescriptor(stdout) );
    prog.setStandardError ( new WriteOnlyDescriptor(stderr) );
    prog.setStandardInput ( new ReadOnlyDescriptor (stdin) );

    let transceiver = new WindowTransceiver(worker);
    let channel     = new Channel("syscall", async (message: string) => {
        let [ returns, id, name, args ] = JSON.parse(message)
    
        let data = await syscall(returns, prog, id, name, args);
        
        if (data)
            channel.postMessage( JSON.stringify(data) );
    })
    transceiver.registerChannel(channel);

    prog.transceiver = transceiver;

    let patcher = new DOMMutationPatcher(document.body);
    // @ts-ignore
    let _bridge = new WorkerDOMBridge(transceiver, "process.dom", patcher, new DOMSubscribable());
    prog.patcher = patcher;

    for (let moduleName in (window as any).modules) {
        let module = (window as any).modules[moduleName] as AbstractModule;

        module.initChannel(transceiver, prog);
        module.initProgram(prog);
    }

    worker.onerror = (event) => {
        console.log(event);
    }
}
