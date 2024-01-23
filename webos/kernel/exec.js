import { BufferDescriptor } from "./descriptor/buffer.js";
import { ReadOnlyDescriptor, WriteOnlyDescriptor } from "./descriptor/reference.js";
import { syscall } from "./kernellib/syscall.js";
import { Program } from "./program.js";

function getAbstractSyntaxTree (code) {
    return Babel.transform(code, { ast: true }).ast;
}

function codeFromAbstractSyntaxTree (ast) {
    return Babel.transformFromAst(ast, "", {});
}

function traverseAST (ast, callback) {
    function dfs (node) {
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

function bindImports (script) {
    const ast = getAbstractSyntaxTree(script);
    
    traverseAST(ast, (node) => {
        if (node.type === "ImportDeclaration") {
            let target = node.source.value;

            // TODO add somewhat of an environment variable such as $PATH
            if (target.startsWith("~")) target = document.location.origin + target.substring(1);

            node.source.value = target;
        }

        return node;
    })

    return codeFromAbstractSyntaxTree(ast).code;
}

export function loadScript (script) {
    script = bindImports(script);
    console.log(script)
    
    let blob = new Blob([ script ], {
        type: "application/js"
    })
    let url = URL.createObjectURL(blob);

    return url;
}
export function execute (script, path) {
    let url = loadScript(script);

    let worker = new Worker(url, { type: "module" });
    let prog   = new Program(worker);

    let stdout = new BufferDescriptor();
    let stderr = new BufferDescriptor();
    let stdin  = new BufferDescriptor();

    prog.setStandardOutput( new WriteOnlyDescriptor(stdout) );
    prog.setStandardError ( new WriteOnlyDescriptor(stderr) );
    prog.setStandardInput ( new ReadOnlyDescriptor (stdin) );

    worker.onmessage = (message) => {
        let [ returns, id, name, args ] = JSON.parse(message.data)
    
        let data = syscall(returns, prog, id, name, args);
        worker.postMessage( JSON.stringify(data) );
    }
    worker.onerror = (event) => {
        console.log(event);
    }
}
