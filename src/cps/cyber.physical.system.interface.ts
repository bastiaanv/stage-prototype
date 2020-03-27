export interface CyberPhysicalSystem {
    getCurrentTemp(): number;
    getReward(): number;

    step(action: number): void;
    randomizeStart(): void;
}
