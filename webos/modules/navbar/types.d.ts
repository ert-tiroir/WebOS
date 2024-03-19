
export type NavbarParameters = {
    type      : "menu",
    name      : string,
    subparams : NavbarParameters[]
} | {
    type      : "button",
    name      : string,
    callback  : () => void,
    shortcut ?: string,
};

export type TransferrableNavbarParameters = {
    type      : "menu",
    name      : string,
    subparams : TransferrableNavbarParameters[]
} | {
    type      : "button",
    name      : string,
    callback  : number,
    shortcut ?: string
};
