import { RewardSystem } from './reward.interface';

/*
    Between 16 and 20 degrees, positive reward. Else negative reward
*/

export class TemperatureReward implements RewardSystem {
    getReward(temp: number): number {
        return temp > 16 && temp <= 20 ? 1 : 0;
    }
}
