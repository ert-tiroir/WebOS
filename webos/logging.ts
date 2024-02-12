
let conf_level: number = 2;
let locale    : string = "en-US";

class LoggingLevel {
    name: string;
    id  : number;

    callback: (...args: any[]) => void;
    constructor (name: string, id: number, callback: (...args: any[]) => void) {
        this.name = name;
        this.id   = id;

        this.callback = callback;
    }

    usable (): boolean {
        return this.id >= conf_level;
    }
    getName (): string {
        return this.name;
    }
}

type LEVEL_LIST = "debug" | "info" | "warning" | "danger" | "critical";

const DEBUG_LEVEL    = new LoggingLevel("DEBUG",    0, console.log);
const INFO_LEVEL     = new LoggingLevel("INFO",     1, console.log);
const WARNING_LEVEL  = new LoggingLevel("WARNING",  2, console.warn);
const DANGER_LEVEL   = new LoggingLevel("DANGER",   3, console.error);
const CRITICAL_LEVEL = new LoggingLevel("CRITICAL", 4, console.error);

const LEVELS = {
    "debug"    : DEBUG_LEVEL,
    "info"     : INFO_LEVEL,
    "warning"  : WARNING_LEVEL,
    "danger"   : DANGER_LEVEL,
    "critical" : CRITICAL_LEVEL
}

class Logger {
    name: string;

    debug   : (message: string) => void;
    info    : (message: string) => void;
    warning : (message: string) => void;
    danger  : (message: string) => void;
    critical: (message: string) => void;

    constructor (name: string) {
        this.name = name;

        for (let key in LEVELS) {
            let level = LEVELS[key as LEVEL_LIST]

            this[key as LEVEL_LIST] = (message: string) => {
                let res = this.format( level.getName(), message );

                if (level.usable())
                    level.callback(res);
            }
        }
    }

    format (levelName: string, message: string) {
        let date = new Date();
        let day  = date.toLocaleDateString(locale)
        let time = date.toLocaleTimeString(locale)

        return `[${day} ${time}] [WebOS-${this.name} ${levelName}] ${message}`;
    }
}

export const DEBUG    = 0;
export const INFO     = 1;
export const WARNING  = 2;
export const DANGER   = 3;
export const CRITICAL = 4;

export function getLogger (name: string) {
    return new Logger(name);
}
export function loggingConfig (level: number) {
    conf_level = level;
}
