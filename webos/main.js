
import { WebSocketClient } from "./api/client.js";
import { FileSystemProvider } from "./api/providers/filesystem/provider.js";
import { DEBUG, loggingConfig } from "./logging.js";

export function loadOS (ip) {
    let client = new WebSocketClient(ip);
    client.addProvider( new FileSystemProvider(client) );

    loggingConfig(DEBUG);
}
