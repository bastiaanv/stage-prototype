import 'mocha';
import { expect } from 'chai';
import { TemperatureRewardSystem } from '../../src/rewards/temperature.reward.system';
import { FacilicomCoin } from '../../src/rewards/facilicom.coin';

describe('Temperature Reward System', () => {
    describe('getReward(temperature)', () => {
        it('Should give a positive reward with a temperature between 18 and 20 degrees', () => {
            const trs = new TemperatureRewardSystem();
            const temperature = 19;

            const expected = new FacilicomCoin(2);
            const actual: FacilicomCoin = trs.getReward(temperature);

            expect(expected).to.deep.equal(actual);
        });

        it('Should give a neutral reward with a temperature between 16 and 18 degrees', () => {
            const trs = new TemperatureRewardSystem();
            const temperature = 17;

            const expected = new FacilicomCoin(0);
            const actual: FacilicomCoin = trs.getReward(temperature);

            expect(expected).to.deep.equal(actual);
        });

        it('Should give a negative reward with a temperature lower than 16 degrees', () => {
            const trs = new TemperatureRewardSystem();
            const temperature = 15;

            const expected = new FacilicomCoin(-2);
            const actual: FacilicomCoin = trs.getReward(temperature);

            expect(expected).to.deep.equal(actual);
        });

        it('Should give a negative reward with a temperature higher than 20 degrees', () => {
            const trs = new TemperatureRewardSystem();
            const temperature = 21;

            const expected = new FacilicomCoin(-2);
            const actual: FacilicomCoin = trs.getReward(temperature);

            expect(expected).to.deep.equal(actual);
        });
    });
});
