import { RewardSystem } from './reward.system.interface';
import { FacilicomCoin } from './facilicom.coin';

/*
    When temperature is between 18 and 20 degrees, return a positive Facilicom coin (Comfort zone)
    When temperature is between 16 and 20 degrees, return a neutral Facilicom coin (Tolerance zone)
    When temperature is outside both, return a negative Facilicom coin (bad zone)
*/
export class TemperatureRewardSystem implements RewardSystem {
    getReward(temperature: number): FacilicomCoin {
        let value = 0;
        if (temperature > 20 || temperature < 16) {
            value = -1;

        } else if (temperature >= 18 && temperature <= 20) {
            value = 1;
        }

        return new FacilicomCoin(value);
    }
}