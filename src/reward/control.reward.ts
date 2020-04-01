import { RewardSystem } from './reward.interface';

/*
    For doing nothing -> positive reward. Else negative reward
*/

export class ControlReward implements RewardSystem {
    getReward(action: number): number {
        return action === 0 ? 1 : 0;
    }
}
