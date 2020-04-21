import 'mocha';
import { expect } from 'chai';
import { Snapshot } from '../../src/domain/snapshot.model';
import { Trainer } from '../../src/math/trainer.math';

describe('Trainer', () => {
    describe('calculatePassiveCooling(snapshots)', () => {
        it('Should return zero as default', () => {
            const snapshots: Snapshot[] = [];

            const expected = 0;
            const actual = Trainer.calculatePassiveCooling(snapshots);

            expect(actual).to.equal(expected);
        });

        it('Should return average overall snapshots', () => {
            const snapshots: Snapshot[] = [
                {
                    when: new Date(2020, 1, 1, 0, 0, 0),
                    temperature: 26.5,
                    heatingPercentage: 0,
                    coolingPercentage: 0,
                },
                {
                    when: new Date(2020, 1, 1, 0, 15, 0),
                    temperature: 26.3,
                    heatingPercentage: 0,
                    coolingPercentage: 0,
                },
                {
                    when: new Date(2020, 1, 1, 0, 30, 0),
                    temperature: 26.0,
                    heatingPercentage: 0,
                    coolingPercentage: 0,
                },
                {
                    when: new Date(2020, 1, 1, 0, 45, 0),
                    temperature: 25.8,
                    heatingPercentage: 0,
                    coolingPercentage: 0,
                },
            ];

            const expected = -0.7/3;
            const actual = Trainer.calculatePassiveCooling(snapshots);

            expect(actual).to.approximately(expected, 3);
        });

        it('Should return average overall snapshots without the active moments', () => {
            const snapshots: Snapshot[] = [
                {
                    when: new Date(2020, 1, 1, 0, 0, 0),
                    temperature: 26.5,
                    heatingPercentage: 0,
                    coolingPercentage: 0,
                },
                {
                    when: new Date(2020, 1, 1, 0, 15, 0),
                    temperature: 26.3,
                    heatingPercentage: 0,
                    coolingPercentage: 1,
                },
                {
                    when: new Date(2020, 1, 1, 0, 30, 0),
                    temperature: 26.0,
                    heatingPercentage: 0,
                    coolingPercentage: 0,
                },
                {
                    when: new Date(2020, 1, 1, 0, 45, 0),
                    temperature: 25.8,
                    heatingPercentage: 0,
                    coolingPercentage: 0,
                },
            ];

            const expected = -0.4/2;
            const actual = Trainer.calculatePassiveCooling(snapshots);

            expect(actual).to.approximately(expected, 3);
        });
    });

    describe('calculateActiveCooling(snapshots)', () => {
        it('Should return zero as default', () => {
            const snapshots: Snapshot[] = [];

            const expected = 0;
            const actual = Trainer.calculateActiveCooling(snapshots);

            expect(actual).to.equal(expected);
        });

        it('Should return average overall snapshots', () => {
            const snapshots: Snapshot[] = [
                {
                    when: new Date(2020, 1, 1, 0, 0, 0),
                    temperature: 26.5,
                    heatingPercentage: 0,
                    coolingPercentage: 1,
                },
                {
                    when: new Date(2020, 1, 1, 0, 15, 0),
                    temperature: 26.3,
                    heatingPercentage: 0,
                    coolingPercentage: 1,
                },
                {
                    when: new Date(2020, 1, 1, 0, 30, 0),
                    temperature: 26.0,
                    heatingPercentage: 0,
                    coolingPercentage: 1,
                },
                {
                    when: new Date(2020, 1, 1, 0, 45, 0),
                    temperature: 25.8,
                    heatingPercentage: 0,
                    coolingPercentage: 1,
                },
            ];

            const expected = -0.7/3;
            const actual = Trainer.calculateActiveCooling(snapshots);

            expect(actual).to.approximately(expected, 3);
        });

        it('Should return average overall snapshots without the active moments', () => {
            const snapshots: Snapshot[] = [
                {
                    when: new Date(2020, 1, 1, 0, 0, 0),
                    temperature: 26.5,
                    heatingPercentage: 0,
                    coolingPercentage: 1,
                },
                {
                    when: new Date(2020, 1, 1, 0, 15, 0),
                    temperature: 26.3,
                    heatingPercentage: 0,
                    coolingPercentage: 0,
                },
                {
                    when: new Date(2020, 1, 1, 0, 30, 0),
                    temperature: 26.0,
                    heatingPercentage: 0,
                    coolingPercentage: 1,
                },
                {
                    when: new Date(2020, 1, 1, 0, 45, 0),
                    temperature: 25.8,
                    heatingPercentage: 0,
                    coolingPercentage: 1,
                },
            ];

            const expected = -0.4/2;
            const actual = Trainer.calculateActiveCooling(snapshots);

            expect(actual).to.approximately(expected, 3);
        });
    });

    describe('calculateActiveHeating(snapshots)', () => {
        it('Should return zero as default', () => {
            const snapshots: Snapshot[] = [];

            const expected = 0;
            const actual = Trainer.calculateActiveHeating(snapshots);

            expect(actual).to.equal(expected);
        });

        it('Should return average overall snapshots', () => {
            const snapshots: Snapshot[] = [
                {
                    when: new Date(2020, 1, 1, 0, 0, 0),
                    temperature: 16.5,
                    heatingPercentage: 1,
                    coolingPercentage: 0,
                },
                {
                    when: new Date(2020, 1, 1, 0, 15, 0),
                    temperature: 16.8,
                    heatingPercentage: 1,
                    coolingPercentage: 0,
                },
                {
                    when: new Date(2020, 1, 1, 0, 30, 0),
                    temperature: 17.0,
                    heatingPercentage: 1,
                    coolingPercentage: 0,
                },
                {
                    when: new Date(2020, 1, 1, 0, 45, 0),
                    temperature: 17.2,
                    heatingPercentage: 1,
                    coolingPercentage: 0,
                },
            ];

            const expected = 0.7/3;
            const actual = Trainer.calculateActiveHeating(snapshots);

            expect(actual).to.approximately(expected, 3);
        });

        it('Should return average overall snapshots without the active moments', () => {
            const snapshots: Snapshot[] = [
                {
                    when: new Date(2020, 1, 1, 0, 0, 0),
                    temperature: 16.5,
                    heatingPercentage: 1,
                    coolingPercentage: 0,
                },
                {
                    when: new Date(2020, 1, 1, 0, 15, 0),
                    temperature: 16.8,
                    heatingPercentage: 0,
                    coolingPercentage: 0,
                },
                {
                    when: new Date(2020, 1, 1, 0, 30, 0),
                    temperature: 16.8,
                    heatingPercentage: 1,
                    coolingPercentage: 0,
                },
                {
                    when: new Date(2020, 1, 1, 0, 45, 0),
                    temperature: 17.0,
                    heatingPercentage: 1,
                    coolingPercentage: 0,
                },
            ];

            const expected = 0.5/2;
            const actual = Trainer.calculateActiveHeating(snapshots);

            expect(actual).to.approximately(expected, 3);
        });
    });
});
