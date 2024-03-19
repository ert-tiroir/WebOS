import { NavbarParameters, TransferrableNavbarParameters } from "./types.js";

export function transformParameters (parameters: NavbarParameters[], callbacks: { [key: number]: () => void }, startingIdx: number): [ TransferrableNavbarParameters[], number ] {
    let idx = startingIdx;
    
    function dfs (parameter: NavbarParameters): TransferrableNavbarParameters {
        if (parameter.type === "button") {
            idx ++;

            callbacks[idx] = parameter.callback;

            return { type: "button", name: parameter.name, callback: idx, shortcut: parameter.shortcut };
        } else if (parameter.type === "menu") {
            return {
                type: "menu", name: parameter.name,
                subparams: parameter.subparams.map(dfs)
            };
        }

        return { type: "button", name: "", callback: -1 };
    }

    let result = parameters.map((x) => dfs(x));
    
    return [ result, idx ];
}
