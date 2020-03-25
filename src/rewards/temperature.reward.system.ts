import { RewardSystem } from './reward.system.interface';
import { FacilicomCoin } from './facilicom.coin';

/*
Behavior temperature reward system:
    When temperature is above 20 degrees and NN was ordering cooling, return a positive Facilicom coin
    When temperature is aboven 20 degrees and NN was not ordering cooling, return a negative Facilicom coin
    When temperature is below 16 degrees and NN was ordering heating, return a positive Facilicom coin
    When temperature is below 16 degrees and NN was not ordering heating, return a negative Facilicom coin
    When temperature is between 18 and 20 degrees and NN was ordering to do nothing, return a positive Facilicom coin
    When temperature is between 18 and 20 degrees and NN was not ordering to do nothing, return a negative Facilicom coin
    When none of the above (temperature between 16 and 18 degrees), return a neutral Facilicom coin
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