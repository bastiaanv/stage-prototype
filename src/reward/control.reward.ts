/*
    Above 20 degrees, positive reward for turning on the AC. Else negative reward
    Below 16 degrees, positive reward for turning on the heater. Else negative reward
    Between 16 and 20 degrees, positive reward for doing noting. Else negative reward
*/

export class RewardSystem {
    getReward(temp:number, action: number, dateTime: Date): number {
        if (dateTime.getHours() => 20 || dateTime.getHours() <= 7) {
            return 1;
        
        } else if (temp < 16 && action === 1 ||
            temp > 20 && action === 2 ||
            temp >= 16 && temp <= 20 && action === 0) {

            return 1;

        } else {
            return 0;
        }
    }
}
