import 'mocha';
import { expect } from 'chai';
import { RewardSystem } from '../../src/reward/reward.system';

describe('Reward system', () => {
    describe('getReward(temp, action, dateTime)', () => {
        it('Should give the maximum positive reward, when the system is doing nothing and the temperatue is good', () => {
            const rewardSystem = new RewardSystem();
            const temp = 20;
            const action = 0;

            const actual = rewardSystem.getReward(temp, action);
            const expected = 1;

            expect(actual).to.equal(expected);
        });

        it('Should give a bad reward, when the system is doing nothing and the temperature is bad', () => {
            const rewardSystem = new RewardSystem();
            const temp = 10;
            const action = 0;

            const actual = rewardSystem.getReward(temp, action);
            const expected = 0;

            expect(actual).to.equal(expected);
        });

        it('Should give the maximum negative reward, when the system is doing something and the temperature is bad', () => {
            const rewardSystem = new RewardSystem();
            const temp = 10;
            const action = 1;

            const actual = rewardSystem.getReward(temp, action);
            const expected = -0.3;

            expect(actual).to.equal(expected);
        });
    });
});