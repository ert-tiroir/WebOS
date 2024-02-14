//
// The load auth module is a module that loads a fixed amount of duration based on the config
//

import { Component } from "~/molyb/molyb/component.js";
import { Molyb } from "~/molyb/molyb/molyb.js";
import { Window } from "~/webos/modules/window/window.js";

class LoadAuthOverlay extends Component {
    constructor (overlay) {
        super();

        this.overlay = overlay;
    }

    init () {}
    update () {
        return Molyb.createElement("div", { className: "flex flex-col w-full h-full" }, ...this.overlay.content.map((content) => {
                if (content.type === "icon")
                    return <div className="flex">
                        <div className="flex-1"></div>
                        <img className="w-25 h-25" src={ content.target }></img>
                        <div className="flex-1"></div>
                    </div>;
                if (content.type === "separator") {
                    if (content.px)
                        return <div className={ `h-[${content.px}px]` }></div>
                    else return <div className={ `flex-[${content.weight}]`}></div>
                }
                if (content.type === "title")
                    return <div className="text-center text-white text-xl">{ content.text }</div>
                if (content.type === "subtitle")
                    return <div className="text-center text-white text-xs font-light">{ content.text }</div>
                if (content.type === "")    
                return undefined;
            }));
    }
}

class LoadAuthModule {
    constructor (duration, overlay) {
        this.duration = duration;
        this.overlay  = overlay;
    }

    start () {
        if (this.overlay !== undefined) {
            const width  = this.overlay.width;
            const height = this.overlay.height;

            let overlay = new LoadAuthOverlay(this.overlay);
            let window  = new Window(overlay, { 
                width, height, 
                minWidth: width, minHeight: height,
                maxWidth: width, maxHeight: height,
                resizable: false, movable: false
            });
            window.open();
        }

        return new Promise((resolve, _) => {
            setTimeout(() => resolve(), this.duration);
        });
    }
}

export function authenticate (config) {
    let duration = config?.duration;
    if (duration === undefined) duration = 10;

    return new LoadAuthModule(duration * 1000, config.overlay);
}
