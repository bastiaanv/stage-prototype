/*
    Between 16 and 20 degrees, positive reward. Else negative reward
*/

export class TemperatureReward {
    getReward(temp: number): number {
        return temp > 16 && temp <= 20 ? 1 : 0;
    }
}
