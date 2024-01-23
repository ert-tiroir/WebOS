
let syscallId = 0;

const callbacks = {};

export function syscall (name, returns, ...args) {
    syscallId ++;

    let data = [returns, syscallId, name, args];
    let str  = JSON.stringify(data);

    postMessage(str);

    if (!returns) return undefined;

    let promise = new Promise((resolve, reject) => {
        callbacks[syscallId] = resolve;
    })

    return promise;
}

addEventListener("message", (event) => {
    let data      = JSON.parse(event.data);
    let answering = data.answering;
    if (!answering) return ;

    let id = data.target;

    let resolve = callbacks[id];
    delete callbacks[id];

    resolve(JSON.parse(data.return_data));
})
