import 'mocha';
import { expect } from 'chai';
import { DataGenerator } from '../../src/data/data.generator';
import { Snapshot } from '../../src/domain/snapshot.model';

describe('Data generator', () => {
    describe('generateLinearData(countQuarters)', () => {
        it('Should generate an empty array if there are no quarters asked', () => {
            const actual = DataGenerator.generateLinearData(0);
            const expected: Snapshot[] = [];

            expect(actual).to.be.deep.equal(expected);
        });

        it('Should generate an empty array if there are no quarters asked', () => {
            const time1 = new Date();
            time1.setUTCHours(0, 0, 0, 0);

            const time2 = new Date();
            time2.setUTCHours(0, 15, 0, 0);

            const actual = DataGenerator.generateLinearData(2);
            const expected: Snapshot[] = [
                {
                    when: time1,
                    temperature: 19.45,
                    outside: null,
                    heatingPercentage: 0,
                    coolingPercentage: 0,
                },
                {
                    when: time2,
                    temperature: 19.4,
                    outside: null,
                    heatingPercentage: 0,
                    coolingPercentage: 0,
                }
            ];

            expect(actual).to.be.deep.equal(expected);
        });
    });
});
