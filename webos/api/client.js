import { getLogger } from "../logging.js";
import { Message } from "./message.js";

const DEFAULT_COOLDOWN = 5;
const STEP_DT_COOLDOWN = 5;
const MAXIMUM_COOLDOWN = 30;

const logger = getLogger("API")

export class WebSocketClient {
    constructor (ip) {
        this.ip = ip;
        
        this.cooldown = DEFAULT_COOLDOWN;
        this.loading  = false;

        this.providers = {}
        this.callbacks = {}

        this.send_uuid = 0;

        this.init();
    }
    addProvider (provider) {
        this.providers[provider.getProviderName()] = provider;
    }
    clear () {
        if (this.websocket) {
            logger.info("Clearing old web socket events")
            
            this.websocket.onload    = undefined;
            this.websocket.onmessage = undefined;
            this.websocket.onerror   = undefined;
            this.websocket.onclose   = undefined;
            
            this.websocket = undefined;
        }
    }
    init () {
        logger.info("Creating and binding web socket")

        this.websocket = new WebSocket(this.ip);

        this.websocket.onopen = (ev) => {
            this.cooldown = DEFAULT_COOLDOWN;
            
            this.onload(ev);
        }
        this.websocket.onmessage = (ev) => this.onmessage (ev)

        this.websocket.onerror = (ev) => {
            logger.danger("An error occured with the socket")
            this.reload();
        }
        this.websocket.onclose = (ev) => {
            logger.danger("The connection was closed")
            this.reload();
        }
    }
    reload () {
        if (this.loading)
            return ;

        this.clear();
        this.loading = true;
        
        logger.info("Trying to reconnect in " + this.cooldown + " seconds")

        setTimeout(() => {
            this.loading = false;
            this.init()
        }, this.cooldown * 1000);

        this.cooldown += STEP_DT_COOLDOWN;

        if (this.cooldown >= MAXIMUM_COOLDOWN) this.cooldown = MAXIMUM_COOLDOWN;
    }

    onload (event) {
        for (let provider in this.providers)
            this.providers[provider].onload();
    }
    onanswer (json) {
        let message = new Message(json);

        let callback = this.callbacks[message.answer_to]
        if (!callback) {
            logger.warning("Could not find the callback for the answer");
            return ;
        }

        let shouldStayOn = callback(message);
        if (shouldStayOn) return ;

        delete this.callbacks[message.answer_to];
    }
    onmessage (data) {
        const json = JSON.parse(data.data);

        if (json['is_answer']) {
            this.onanswer(json);
            return ;
        }

        let provider_name = json['provider'];
        if (provider_name === undefined) {
            logger.critical("Wrong protocol exception, the server did not provide the provider field");
            return ;
        }

        let provider = this.providers[provider_name];
        if (provider === undefined) {
            logger.critical("Could not find the provider : " + provider);
            return ;
        }

        provider.onmessage( new Message(json) );
    }

    send (target, data, callback) {
        if (callback)
            this.callbacks[this.send_uuid] = callback;
        
        data = {
            "provider": target,
            "data": data,
            "uuid": this.send_uuid ++
        };

        this.websocket.send(JSON.stringify(data))
    }
}
