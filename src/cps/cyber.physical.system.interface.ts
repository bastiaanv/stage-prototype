import { FacilicomCoin } from '../rewards/facilicom.coin';

export interface CyberPhysicalSystem {
    readonly datasetSize: number;

    getCurrentTemp(): number;
    getReward(): FacilicomCoin[];

    step(actions: number[]): void;
    start(shouldRandomize?: boolean): void
}
