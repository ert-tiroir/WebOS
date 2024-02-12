import { getLogger } from "../logging.js";
import { Message, MessageType } from "./message.js";
import { AbstractProvider } from "./providers/abstract.js";

const DEFAULT_COOLDOWN = 5;
const STEP_DT_COOLDOWN = 5;
const MAXIMUM_COOLDOWN = 30;

const logger = getLogger("API")

export class WebSocketClient {
    ip      : string;
    cooldown: number;
    loading : boolean;

    providers: { [key: string]: AbstractProvider };
    callbacks: { [key: string]: (message: Message) => boolean };

    send_uuid: number;

    websocket: WebSocket | null;

    constructor (ip: string) {
        this.ip = ip;
        
        this.cooldown = DEFAULT_COOLDOWN;
        this.loading  = false;

        this.providers = {}
        this.callbacks = {}

        this.send_uuid = 0;

        this.init();
    }
    addProvider (provider: AbstractProvider) {
        this.providers[provider.getProviderName()] = provider;
    }
    clear () {
        if (this.websocket) {
            logger.info("Clearing old web socket events")
            
            this.websocket.onopen    = null;
            this.websocket.onmessage = null;
            this.websocket.onerror   = null;
            this.websocket.onclose   = null;
            
            this.websocket = null;
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

        this.websocket.onerror = (_) => {
            logger.danger("An error occured with the socket")
            this.reload();
        }
        this.websocket.onclose = (_) => {
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

    onload (_: Event) {
        for (let provider in this.providers)
            (this.providers[provider] as any).onload();
    }
    onanswer (json: MessageType) {
        let message = new Message(json);
        let target  = message.answer_to
        if (target === undefined) return ;

        let callback = this.callbacks[target]
        if (!callback) {
            logger.warning("Could not find the callback for the answer");
            return ;
        }

        let shouldStayOn = callback(message);
        if (shouldStayOn) return ;

        delete this.callbacks[target];
    }
    onmessage (data: MessageEvent<any>) {
        const json = JSON.parse(data.data);

        if (json['is_answer']) {
            this.onanswer(json as MessageType);

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

    send (target: string, data: any, callback: ((message: Message) => boolean) | undefined) {
        if (callback)
            this.callbacks[this.send_uuid] = callback;
        
        data = {
            "provider": target,
            "data": data,
            "uuid": this.send_uuid ++
        };

        if (this.websocket === null) return ;
        this.websocket.send(JSON.stringify(data))
    }
}
