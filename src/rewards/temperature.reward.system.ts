import { RewardSystem } from './reward.system';
import { FacilicomCoin } from './facilicom.coin';

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