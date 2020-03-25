import 'mocha';
import { expect } from 'chai';
import { TemperatureRewardSystem } from '../../src/rewards/temperature.reward.system';
import { FacilicomCoin } from '../../src/rewards/facilicom.coin';

describe('Temperature Reward System', () => {
    describe('getReward(temperature)', () => {
        it('Should give a positive reward with a temperature above 20 degrees and NN was ordering cooling', () => {
            const trs = new TemperatureRewardSystem();
            const temperature = 22;

            const expected = new FacilicomCoin(1);
            const actual: FacilicomCoin = trs.getReward(temperature, false, true);

            expect(expected).to.deep.equal(actual);
        });

        it('Should give a negative reward with a temperature above 20 degrees and NN was not ordering cooling', () => {
            const trs = new TemperatureRewardSystem();
            const temperature = 22;

            const expected = new FacilicomCoin(-1);
            const actual: FacilicomCoin = trs.getReward(temperature, false, false);

            expect(expected).to.deep.equal(actual);
        });

        it('Should give a positive reward with a temperature below 16 degrees and NN was ordering heating', () => {
            const trs = new TemperatureRewardSystem();
            const temperature = 15;

            const expected = new FacilicomCoin(1);
            const actual: FacilicomCoin = trs.getReward(temperature, true, false);

            expect(expected).to.deep.equal(actual);
        });

        it('Should give a negative reward with a temperature below 16 degrees and NN was not ordering heating', () => {
            const trs = new TemperatureRewardSystem();
            const temperature = 15;

            const expected = new FacilicomCoin(-1);
            const actual: FacilicomCoin = trs.getReward(temperature, false, false);

            expect(expected).to.deep.equal(actual);
        });

        it('Should give a positive reward with a temperature between 18 and 20 degrees and NN was ordering to do nothing', () => {
            const trs = new TemperatureRewardSystem();
            const temperature = 19;

            const expected = new FacilicomCoin(1);
            const actual: FacilicomCoin = trs.getReward(temperature, false, false);

            expect(expected).to.deep.equal(actual);
        });

        it('Should give a negative reward with a temperature below 18 and 20 degrees and NN was not ordering to do nothing', () => {
            const trs = new TemperatureRewardSystem();
            const temperature = 19;

            const expected = new FacilicomCoin(-1);
            const actual: FacilicomCoin = trs.getReward(temperature, true, false);

            expect(expected).to.deep.equal(actual);
        });

        it('Should give a neutral reward with a temperature between 16 and 18 degrees', () => {
            const trs = new TemperatureRewardSystem();
            const temperature = 17;

            const expected = new FacilicomCoin(0);
            const actual: FacilicomCoin = trs.getReward(temperature, false, false);

            expect(expected).to.deep.equal(actual);
        });
    });
});
