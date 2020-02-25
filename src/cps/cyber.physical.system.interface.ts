export interface CyberPhysicalSystem {
    readonly datasetSize: number;
    getCurrentTemp(): number;
    step(actionHeating: number, actionCooling: number): void;
}
