import 'mocha';
import { expect } from 'chai';
import { TemperatureReward } from '../../src/reward/temperature.reward';

describe('Temperature Reward System', () => {
    describe('getReward(temperature, action)', () => {
        it('Should give a positive reward with a temperature between 16 and 20 degrees', () => {
            const trs = new TemperatureReward();
            const temperature = 19;

            const expected = 1;
            const actual: number = trs.getReward(temperature);

            expect(actual).to.equal(expected);
        });

        it('Should give a negative reward with a temperature above 20 degrees', () => {
            const trs = new TemperatureReward();
            const temperature = 22;

            const expected = 0;
            const actual: number = trs.getReward(temperature);

            expect(actual).to.equal(expected);
        });

        it('Should give a negative reward with a temperature below 16 degrees', () => {
            const trs = new TemperatureReward();
            const temperature = 15;

            const expected = 0;
            const actual: number = trs.getReward(temperature);

            expect(actual).to.equal(expected);
        });
    });
});
