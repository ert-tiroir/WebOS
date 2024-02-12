
export class AbstractProvider {
    client: WebSocketClient;

    constructor (client: WebSocketClient) {
        this.client = client;
    }
    getProviderName (): string {
        throw 'AbstractProvider does not implement the getProviderName function';
    }

    onload () {}
    onmessage (_: Message) {

    }
    onclose () {

    }
}

import { WebSocketClient } from "../client.js";
import { Message } from "../message.js";

