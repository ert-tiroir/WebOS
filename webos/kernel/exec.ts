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

function traverseAST (ast: any, callback: (node: any) => any) {
    function dfs (node: any) {
        if (node.body !== undefined) {
            let nbody = [];
            for (let next of node.body)
                nbody.push(dfs(next));
            
            node.body = nbody;
        }

        node = callback(node);

        return node;
    }

    ast.program = dfs(ast.program);
    return ast;
}

function bindImports (script: string) {
    const ast = getAbstractSyntaxTree(script);
    
    traverseAST(ast, (node) => {
        if (node.type === "ImportDeclaration") {
            let target = node.source.value;

            // TODO add somewhat of an environment variable such as $PATH
            if (target.startsWith("~")) target = document.location.origin + "/lib" + target.substring(1);

            node.source.value = target;
        }

        return node;
    })

    return codeFromAbstractSyntaxTree(ast).code;
}

export function loadScript (script: string) {
    script = bindImports(script);
    console.log(script)
    
    let blob = new Blob([ script ], {
        type: "application/js"
    })
    let url = URL.createObjectURL(blob);

    return url;
}
export function execute (script: string, _path: string) {
    let url = loadScript(script);

    let worker = new Worker(url, { type: "module" });
    let prog   = new Program(worker);

    let stdout = new BufferDescriptor();
    let stderr = new BufferDescriptor();
    let stdin  = new BufferDescriptor();

    prog.setStandardOutput( new WriteOnlyDescriptor(stdout) );
    prog.setStandardError ( new WriteOnlyDescriptor(stderr) );
    prog.setStandardInput ( new ReadOnlyDescriptor (stdin) );

    let transceiver = new WindowTransceiver(worker);
    let channel     = new Channel("syscall", (message: string) => {
        let [ returns, id, name, args ] = JSON.parse(message)
    
        let data = syscall(returns, prog, id, name, args);
        
        if (data)
            channel.postMessage( JSON.stringify(data) );
    })
    transceiver.registerChannel(channel);

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
