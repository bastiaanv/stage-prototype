import { FacilicomCoin } from '../rewards/facilicom.coin';

export interface CyberPhysicalSystem {
    readonly datasetSize: number;

    getCurrentTemp(): number;
    getReward(): FacilicomCoin[];

    step(actionHeating: number, actionCooling: number): void;
}
