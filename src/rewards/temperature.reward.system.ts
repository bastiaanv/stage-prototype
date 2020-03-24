import { RewardSystem } from './reward.system.interface';
import { FacilicomCoin } from './facilicom.coin';

/*
    When temperature is between 18 and 20 degrees, return a positive Facilicom coin (Comfort zone)
    When temperature is between 16 and 20 degrees, return a neutral Facilicom coin (Tolerance zone)
    When temperature is outside both, return a negative Facilicom coin (bad zone)
*/
export class TemperatureRewardSystem implements RewardSystem {
    private readonly rewardFactor = 1;

    getReward(temperature: number, wasHeating: boolean, wasCooling: boolean): FacilicomCoin {
        let value = 0;
        if (temperature > 20) {
            value = this.rewardFactor * (wasCooling ? 1 : -1);

        } else if (temperature < 16) {
            value = this.rewardFactor * (wasHeating ? 1 : -1);

        } else if (temperature > 18 && temperature <= 20) {
            value = this.rewardFactor * (!wasHeating && !wasCooling ? 1 : -1);
        }

        return new FacilicomCoin(value);
    }
}