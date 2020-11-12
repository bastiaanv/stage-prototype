/*
    Between 18 and 22 degrees, positive reward of 1
    When doing a action, negative reward of 0.2
*/

export class RewardSystem {
    getReward(temp: number, action: number): number {
        let reward = 0;
        reward += (temp >= 18 && temp <= 22 ? 1 : 0);
        reward -= (action !== 0 ? 0.2 : 0);

        return reward;
    }
}
