export interface Formula {
    next(): number;
    isActivelyHeating(): boolean;
    isActivelyCooling(): boolean;
}