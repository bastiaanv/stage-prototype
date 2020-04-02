import 'mocha';
import { expect } from 'chai';
import { RewardSystem } from '../../src/reward/reward.system';

describe('Reward system', () => {
    describe('getReward(temp, action, dateTime)', () => {
        it('Should give a positive reward, when it is between 20:00 and 07:00 hour and the system is doing nothing', () => {
            const rewardSystem = new RewardSystem();
            const temp = 10;
            const action = 0;
            const date = new Date(2020, 4, 2, 2, 0, 0, 0);

            const actual = rewardSystem.getReward(temp, action, date);
            const expected = 1;

            expect(actual).to.equal(expected);
        });

        it('Should give a bad reward, when it is between 20:00 and 07:00 hour and the system is NOT doing nothing', () => {
            const rewardSystem = new RewardSystem();
            const temp = 10;
            const action = 2;
            const date = new Date(2020, 4, 2, 2, 0, 0, 0);

            const actual = rewardSystem.getReward(temp, action, date);
            const expected = 0;

            expect(actual).to.equal(expected);
        });

        it('Should give a positive reward, when it is between 07:00 and 20:00 hour, the temp is below 16 degrees and the system is heating', () => {
            const rewardSystem = new RewardSystem();
            const temp = 10;
            const action = 1;
            const date = new Date(2020, 4, 2, 10, 0, 0, 0);

            const actual = rewardSystem.getReward(temp, action, date);
            const expected = 1;

            expect(actual).to.equal(expected);
        });

        it('Should give a bad reward, when it is between 07:00 and 20:00 hour, the temp is below 16 degrees and the system is NOT heating', () => {
            const rewardSystem = new RewardSystem();
            const temp = 10;
            const action = 2;
            const date = new Date(2020, 4, 2, 10, 0, 0, 0);

            const actual = rewardSystem.getReward(temp, action, date);
            const expected = 0;

            expect(actual).to.equal(expected);
        });

        it('Should give a positive reward, when it is between 07:00 and 20:00 hour, the temp is above 20 degrees and the system is cooling', () => {
            const rewardSystem = new RewardSystem();
            const temp = 25;
            const action = 2;
            const date = new Date(2020, 4, 2, 10, 0, 0, 0);

            const actual = rewardSystem.getReward(temp, action, date);
            const expected = 1;

            expect(actual).to.equal(expected);
        });

        it('Should give a bad reward, when it is between 07:00 and 20:00 hour, the temp is above 20 degrees and the system is NOT cooling', () => {
            const rewardSystem = new RewardSystem();
            const temp = 25;
            const action = 1;
            const date = new Date(2020, 4, 2, 10, 0, 0, 0);

            const actual = rewardSystem.getReward(temp, action, date);
            const expected = 0;

            expect(actual).to.equal(expected);
        });

        it('Should give a positive reward, when it is between 07:00 and 20:00 hour, the temp is between 16 and 20 degrees and the system is doing nothing', () => {
            const rewardSystem = new RewardSystem();
            const temp = 19;
            const action = 0;
            const date = new Date(2020, 4, 2, 10, 0, 0, 0);

            const actual = rewardSystem.getReward(temp, action, date);
            const expected = 1;

            expect(actual).to.equal(expected);
        });

        it('Should give a bad reward, when it is between 07:00 and 20:00 hour, the temp is between 16 and 20 degrees and the system is NOT doing nothing', () => {
            const rewardSystem = new RewardSystem();
            const temp = 19;
            const action = 1;
            const date = new Date(2020, 4, 2, 10, 0, 0, 0);

            const actual = rewardSystem.getReward(temp, action, date);
            const expected = 0;

            expect(actual).to.equal(expected);
        });
    });
});