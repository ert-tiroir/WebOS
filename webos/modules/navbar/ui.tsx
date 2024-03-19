import { DocumentType } from "../../../molyb/vdom/virtualdom/virtual/document.js";
import { Node } from "../../../molyb/vdom/virtualdom/virtual/tree/node.js";
import { Component } from "../../../molyb/molyb/component.js";
import { Molyb } from "../../../molyb/molyb/molyb.js";
import { TransferrableNavbarParameters } from "./types.js";

type NavbarComponentConfig = {
    isRoot:  boolean,
    isFirst: boolean,

    type: string,
    groupName: string
};

function resolveTextClassName (config: NavbarComponentConfig) {
    const defaultText = "whitespace-nowrap py-2 text-white select-none text-xs mx-2";
    const appNameText = "font-bold";

    let classes = [ defaultText ];
    if (config.isRoot && config.isFirst) classes.push(appNameText);

    return classes.join(" ");
}

function resolveMenuClassName (config: NavbarComponentConfig) {
    const positionMenu = "absolute";

    const  rootPosition = "left-0 bottom-0 translate-y-full";
    const childPosition = "right-0 top-0 translate-x-full";

    const sizeMenu = config.isRoot ? "w-fit min-w-full" : "min-h-full";
    const backgroundMenu = "bg-[rgba(217,217,217,0.3)] backdrop-blur-xl";

    const visibilityMenu = `hidden group-hover/${config.groupName}:block`;

    let classes = [positionMenu, sizeMenu, visibilityMenu, backgroundMenu];
    if (config.isRoot) classes.push(rootPosition);
    else classes.push(childPosition);

    return classes.join(" ");
}

function asNavbarComponent (callback: (index: number) => void, config: TransferrableNavbarParameters, isRoot: boolean, isFirst: boolean, depth: number = 0) {
    const componentConfig: NavbarComponentConfig = {
        isRoot, isFirst,

        type: config.type,
        groupName: `navbar-depth-${depth}`
    };

    const textClassName = resolveTextClassName(componentConfig);

    if (config.type === "button") {
        return <div className={textClassName} onclick={ () => callback(config.callback) }>
            { config.name }
        </div>
    } else if (config.type === "menu") {
        let idx = 0;
        return <div className={`w-fit relative top-0 h-8 group/navbar-depth-${depth}`}>
            <div className={textClassName}>
                { config.name }
            </div>

            <div className={resolveMenuClassName(componentConfig)}>
                { ...config.subparams.map((x) => asNavbarComponent(callback, x, false, (idx ++) == 0, depth + 1)) }
            </div>
        </div>
    }
}

export class NavbarComponent extends Component {
    element:  Node<number, DocumentType<number>>;
    config:   TransferrableNavbarParameters[];
    callback: (index: number) => void;

    constructor (callback: (index: number) => void, config: TransferrableNavbarParameters[]) {
        super();

        this.config   = config;
        this.callback = callback;
    }

    init(): void {
        let idx = 0;
        this.element = <div className="absolute z-[1000000] flex top-0 left-0 w-full h-8 bg-[rgba(217,217,217,0.4)] backdrop-blur-xl">
            <img src={ "assets/example/ert_shadow_icon.png" } className="w-6 h-6 ml-4 mr-2 my-1"/>
        
            {...this.config.map((x) => asNavbarComponent((index: number) => {
                this.callback(index);
            }, x, true, (idx ++) == 0))}
        </div>;
    }
    update(): Node<number, DocumentType<number>> | undefined {
        return this.element;
    }
}
