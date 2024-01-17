
export class AbstractProvider {
    constructor (client) {
        this.client = client;
    }
    getProviderName () {
        throw 'AbstractProvider does not implement the getProviderName function';
    }

    onload () {
        this.client.send({ "message": "hi !" })
    }
    onmessage (message) {

    }
    onclose () {

    }
}
