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
});