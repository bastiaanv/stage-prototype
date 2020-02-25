export interface CyberPhysicalSystem {
    getCurrentTemp(): number;
    step(actionHeating: number, actionCooling: number): void;
}
