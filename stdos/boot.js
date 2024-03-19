
import { open, read } from "~/webos/kernel/workerlib/unistd.js";
import { getLogger } from "~/webos/logging.js";
import { exit, load } from "~/webos/kernel/workerlib/stdlib.js";

(async () => {

    const logger = getLogger("Boot");

    logger.info("Starting boot program")
    let desc = await open("/.config", "r");

    if (desc < 0) {
        logger.critical("Could not open .config file");
        exit(-1);
    }

    let config;
    try {
        let data = await read(desc, 1e9);

        config = JSON.parse(data);
    } catch (exception) {
        logger.critical("Could not read .config file using format JSON");
        exit(-1);
    }

    desktop.getContract().setBackground(config.desktop);
    
    let authPath = config?.auth?.path;

    let authModule = await load(authPath);
    if (authModule === null) {
        logger.critical("Could not read the authentication module at path " + authPath);
        exit(-1);
    }

    try {
        let authContainer = (await import(authModule)).authenticate(config?.auth?.config);
        
        await authContainer.start();
    } catch (exception) {
        logger.critical("Could not use the authentication module at path " + authPath + ". Maybe you forgot to export authenticate(config: any): { start: () => {} }.");
        logger.critical(exception)
        exit(-1);
    }

    logger.info("Finished boot !")

    const defaultNavbar = navbar.registerNavbar([
        {
            type: "menu",
            name: "WebOS",
            subparams: []
        },
        {
            type: "menu",
            name: "View",
            subparams: [
                {
                    type: "button",
                    name: "Open Shell",
                    shortcut: "Alt+T",
                    callback: () => {
                        
                    }
                }
            ]
        }
    ])

    navbar.setDefaultNavbar(defaultNavbar);
})();
