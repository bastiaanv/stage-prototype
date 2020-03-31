import { RewardSystem } from './reward.interface';

/*
    Above 20 degrees, positive reward for turning on the AC. Else negative reward
    Below 16 degrees, positive reward for turning on the heater. Else negative reward
    Between 16 and 20 degrees, positive reward for doing noting. Else negative reward
*/

export class TemperatureReward implements RewardSystem {
    getReward(temp: number): number {
        return temp > 16 && temp <= 20 ? 1 : 0;
    }
}
