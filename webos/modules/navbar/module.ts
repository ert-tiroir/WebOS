import { AbstractModule, ModuleExtension } from "../abstract.js";
import { Program } from "../../kernel/program.js";
import { NavbarParameters, TransferrableNavbarParameters } from "./types.js";
import { transformParameters } from "./utils.js";
import { Transceiver } from "../../../molyb/vdom/virtualdom/bridge/channels/transceiver.js";
import { Channel } from "../../../molyb/vdom/virtualdom/bridge/channels/channel.js";
import { NavbarComponent } from "./ui.js";
import { Molyb } from "../../../molyb/molyb/molyb.js";

export class NavbarExtension extends ModuleExtension {
    channel: Channel;
    navbars: { [key: number]: NavbarComponent } = {};

    constructor (channel: Channel) {
        super();

        this.channel = channel;
    }
}

export class NavbarModule extends AbstractModule {
    resultChannel: Channel;
    callbackIdx = 0;
    callbacks: { [key: number]: () => void } = {};

    navbars: { [key: number]: any } = {};
    lastId = 0;

    defaultNavbar: NavbarComponent | undefined = undefined;
    currentNavbar: NavbarComponent | undefined = undefined;

    init(): void {
        if (globalThis.document === undefined) return ;
    }
    destroy(): void {}
    getName(): string {
        return "navbar";
    }
    initChannel(transceiver: Transceiver, ...supArgs: any[]): void {
        super.initChannel(transceiver, ...supArgs);

        if (globalThis.document !== undefined) return ;

        this.resultChannel = new Channel("navbar.callback", (data: string) => {
            let json = JSON.parse(data);

            let callback = this.callbacks[json.callback];
            if (callback === undefined) return ;

            callback();
        })
        transceiver.registerChannel(this.resultChannel);
    }
    initProgram(program: Program): void {
        super.initProgram(program);
    }
    getWorkerContract() {
        return { 
            registerNavbar: (params: NavbarParameters[]) => {
                let [ tp, ccount ] = transformParameters(params, this.callbacks, this.callbackIdx);
                this.callbackIdx = ccount;

                this.call("registerNavbar", tp, this.lastId);

                this.lastId ++;

                return this.lastId - 1;
            }, setDefaultNavbar: (index: number) => {
                this.call("setDefaultNavbar", index);
            }, focus: (index: number) => { this.call("focus", index); },
            unfocus: () => this.call("unfocus")
        };
    }
    getWorkerEquivalent() {
        return {
            registerNavbar: (program: Program, params: TransferrableNavbarParameters[], index: number) => {
                this.getExtension(program)
                    .navbars[ index ] = new NavbarComponent((index: number) => {
                        this.getExtension(program).channel.postMessage({ callback: index });
                    }, params);
            }, setDefaultNavbar: (program: Program, index: number) => {
                let navbar = this.getExtension(program).navbars[index];
                if (navbar === undefined) return ;
                
                let oldNavbar = this.defaultNavbar;
                
                this.defaultNavbar = navbar;
                if (oldNavbar === this.currentNavbar && oldNavbar !== undefined) {
                    this.getGlobalContract().unfocus();
                }
                if (this.currentNavbar === undefined && navbar !== undefined) {
                    this.getGlobalContract().focus(navbar);
                }
            }, focus: (program: Program, index: number) => {
                this.getGlobalContract().focus(this.getExtension(program).navbars[index]);
            }, unfocus: (program: Program) => { this.getGlobalContract().unfocus(); }
        };
    }
    getGlobalContract() {
        return {
            focus (navbar: NavbarComponent | undefined) {
                let component = navbar?.render(true);
                if (component === undefined) return ;
        
                Molyb.document.appendChild(component);
        
                if (this.currentNavbar !== undefined) {
                    let component = this.currentNavbar.render(true);
                    
                    if (component !== undefined)
                        Molyb.document.removeChild(component);
                }
        
                this.currentNavbar = navbar;
            },
            unfocus () {
                if (this.currentNavbar !== undefined) {
                    let component = this.currentNavbar.render(true);
                    
                    if (component !== undefined)
                        Molyb.document.removeChild(component);
                    
                    this.currentNavbar = undefined;
                }
        
                if (this.defaultNavbar === undefined) return ;
                this.focus(this.defaultNavbar);
            }
        };
    }

    getExtension (program: Program) {
        return program.getExtension(this.getName()) as NavbarExtension;
    }
    createExtension(program: Program): ModuleExtension {
        let channel = new Channel("navbar.callback", (_data: string) => 0);
        program.transceiver.registerChannel(channel);

        return new NavbarExtension(channel);
    }

}
