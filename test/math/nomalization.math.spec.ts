import 'mocha';
import { expect } from 'chai';
import { Normalization } from '../../src/math/normalization.math';

describe('Normalization', () => {
    describe('temperature(temp)', () => {
        it('Should return 0.5833 for a temperture of 15 degrees', () => {
            const temp = 15;

            const actual = Normalization.temperature(temp);
            const expected = 0.5833

            expect(actual).to.approximately(expected, 4);
        });

        it('Should return 0.75 for a temperture of 25 degrees', () => {
            const temp = 25;

            const actual = Normalization.temperature(temp);
            const expected = 0.75

            expect(actual).to.approximately(expected, 4);
        });
    });

    describe('reward(reward, max)', () => {
        it('Should return 1 for a maximum reward', () => {
            const reward = 1;

            const actual = Normalization.reward(reward, 1);
            const expected = 1;

            expect(actual).to.approximately(expected, 4);
        });

        it('Should return 0 for a none reward', () => {
            const reward = 0;

            const actual = Normalization.reward(reward, 1);
            const expected = 0;

            expect(actual).to.approximately(expected, 4);
        });

        it('Should return 0.33 for a 1/3 reward', () => {
            const reward = 1;

            const actual = Normalization.reward(reward, 3);
            const expected = 0.3333;

            expect(actual).to.approximately(expected, 4);
        });
    });

    describe('time(date)', () => {
        it('Should return 0 for time is 00:00', () => {
            const date = new Date(2020, 4, 2, 0, 0, 0, 0);

            const actual = Normalization.time(date);
            const expected = 0;

            expect(actual).to.approximately(expected, 4);
        });

        it('Should return 0.5 for time is 12:00', () => {
            const date = new Date(2020, 4, 2, 12, 0, 0, 0);

            const actual = Normalization.time(date);
            const expected = 0.5;

            expect(actual).to.approximately(expected, 4);
        });

        it('Should return 0 for time is 23:00', () => {
            const date = new Date(2020, 4, 2, 23, 0, 0, 0);

            const actual = Normalization.time(date);
            const expected = 1;

            expect(actual).to.approximately(expected, 4);
        });
    });
});