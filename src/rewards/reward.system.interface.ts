import { FacilicomCoin } from './facilicom.coin';

export interface RewardSystem {
    getReward(value: number, wasHeating: boolean, wasCooling: boolean): FacilicomCoin;
}
