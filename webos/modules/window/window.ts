import { DocumentType } from "../../../molyb/vdom/virtualdom/virtual/document.js";
import { Node } from "../../../molyb/vdom/virtualdom/virtual/tree/node.js";
import { Component } from "../../../molyb/molyb/component.js";
import { Molyb } from "../../../molyb/molyb/molyb.js";
import { MovementType } from "./manager.js";

const BORDERS: [ (size: number) => string, number ][] = [
    [ (size: number) => `cursor-nwse-resize absolute left-0 top-0 w-${size} h-${size}`,  MovementType.LEFT_BORDER  | MovementType.TOP_BORDER ],
    [ (size: number) => `cursor-nesw-resize absolute right-0 top-0 w-${size} h-${size}`, MovementType.RIGHT_BORDER | MovementType.TOP_BORDER ],
    [ (size: number) => `cursor-nesw-resize absolute left-0 bottom-0 w-${size} h-${size}`,  MovementType.LEFT_BORDER  | MovementType.BOTTOM_BORDER ],
    [ (size: number) => `cursor-nwse-resize absolute right-0 bottom-0 w-${size} h-${size}`, MovementType.RIGHT_BORDER | MovementType.BOTTOM_BORDER ],
    [ (size: number) => `cursor-ns-resize absolute left-${size} top-0 h-${size} w-[calc(100%_-_${8 * size}px)]`, MovementType.TOP_BORDER  ],
    [ (size: number) => `cursor-ew-resize absolute left-0 top-${size} w-${size} h-[calc(100%_-_${8 * size}px)]`, MovementType.LEFT_BORDER ],
    [ (size: number) => `cursor-ns-resize absolute left-${size} bottom-0 h-${size} w-[calc(100%_-_${8 * size}px)]`, MovementType.BOTTOM_BORDER  ],
    [ (size: number) => `cursor-ew-resize absolute right-0 top-${size} w-${size} h-[calc(100%_-_${8 * size}px)]`, MovementType.RIGHT_BORDER ],
]

export type WindowProps = {
    width: number, height: number,

    minWidth?: number,
    maxWidth?: number,

    minHeight?: number,
    maxHeight?: number,

    resizable?: boolean,
    size     ?: number
};

export class Window extends Component {
    private view:   Component;
    private window: Node<number, DocumentType<number>>;
    private props:  WindowProps;

    constructor (view: Component, props: WindowProps) {
        super();

        this.view  = view;
        this.props = props;
    }

    open () {
        let result = this.render(false);
        if (result === undefined) return ;

        Molyb.document.appendChild(result);
    }
    close () {}

    init(): void {
        let size = 2;
        if (this.props.size) size = this.props.size;

        let childrens = [];
        let movers: [Node<number, DocumentType<number>>, number][] = [];
        for (let [ call, type ] of BORDERS) {
            let child = Molyb.createElement("div", { className: call(size) });
            if (child === undefined) continue;

            childrens.push(child);

            movers.push([child, type]);
        }

        childrens.push(this.view.render(false));
        let node = Molyb.createElement("div", { className: `absolute backdrop-blur-xl rounded-3xl bg-[rgba(217,217,217,0.2)]` }, ...childrens);
        if (node === undefined) return ;

        this.window = node;

        windows.getWorkerContract().registerWindow(this.window, this.props, ...movers);
    }
    update(): Node<number, DocumentType<number>> | undefined {
        return this.window;
    }
}
