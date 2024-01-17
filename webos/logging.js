
let conf_level = 2;
let locale     = "en-US";

class LoggingLevel {
    constructor (name, id, callback) {
        this.name = name;
        this.id   = id;

        this.callback = callback;
    }

    usable () {
        return this.id >= conf_level;
    }
    getName () {
        return this.name;
    }
}

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
    constructor (name) {
        this.name = name;

        for (let key in LEVELS) {
            let level = LEVELS[key]

            this[key] = (message) => {
                let res = this.format( level.getName(), message );

                if (level.usable())
                    level.callback(res);
            }
        }
    }

    format (levelName, message) {
        let date = new Date();
        let day  = date.toLocaleDateString(locale)
        let time = date.toLocaleTimeString(locale)

        return `[${day} ${time}] [WebOS-${this.name} ${levelName}] ${message}`;
    }

    // Fake implementations to trick the type checks
    debug    (message) {}
    info     (message) {}
    warning  (message) {}
    danger   (message) {}
    critical (message) {}
}

export const DEBUG    = 0;
export const INFO     = 1;
export const WARNING  = 2;
export const DANGER   = 3;
export const CRITICAL = 4;

export function getLogger (name) {
    return new Logger(name);
}
export function loggingConfig (level) {
    conf_level = level;
}
