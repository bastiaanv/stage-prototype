import 'mocha';
import { expect } from 'chai';
import { TemperatureApproach } from '../../src/cps/temperature.approach';
import { Snapshot } from '../../src/domain/snapshot.model';

describe('Room temperature approach', () => {
    describe('make(snapshots, initTemp, outsideTemp, heatingTemp, coolingTemp)', () => {
        it('Should make a CPS-like class', () => {
            const actual = TemperatureApproach.make([], 0, 0, 0, 0);

            // tslint:disable-next-line: no-unused-expression
            expect(actual).to.be.not.undefined
        });
    });

    describe('getReward()', () => {
        it('Should give a positive reward, because temp is between 16 and 20 and lastAction is "Do nothing"', () => {
            const cps = TemperatureApproach.make([], 0, 0, 0, 19.5);

            const actual = cps.getReward();
            const expected = 1;

            expect(actual).to.equal(expected);
        });

        it('Should give a negative reward, because temp outside 18 and 20 and lastAction is "Do nothing"', () => {
            const cps = TemperatureApproach.make([], 0, 0, 0, 23.5);

            const actual = cps.getReward();
            const expected = 0

            expect(actual).to.equal(expected);
        });
    });

    describe('step(actions)', () => {
        it('Should throw exception if actions parameters does not match nr of actions in the system', () => {
            const cps = TemperatureApproach.make([], 0, 0, 0);

            // tslint:disable-next-line: no-unused-expression
            expect(() => cps.step(4)).to.throw('Action does not match actions available');
        });

        it('Should degrees temperature with 0.2 due to passively cooling', () => {
            const startTemp = 19.7;
            const snapshots: Snapshot[] = [
                {
                    when: new Date(2020, 1, 1, 0, 0, 0),
                    value: 26.5,
                    heatingPercentage: 0,
                    coolingPercentage: 0,
                },
                {
                    when: new Date(2020, 1, 1, 0, 15, 0),
                    value: 26.3,
                    heatingPercentage: 0,
                    coolingPercentage: 0,
                },
                {
                    when: new Date(2020, 1, 1, 0, 30, 0),
                    value: 26.1,
                    heatingPercentage: 0,
                    coolingPercentage: 0,
                },
                {
                    when: new Date(2020, 1, 1, 0, 45, 0),
                    value: 25.9,
                    heatingPercentage: 0,
                    coolingPercentage: 0,
                },
            ]
            const cps = TemperatureApproach.make(snapshots, 15, 40, 15, startTemp);

            cps.step(0);
            const actual = startTemp - cps.getCurrentTemp();
            const expected = 0.2;

            expect(actual).to.be.approximately(expected, 0.01);
        });

        it('Should degrees temperature with 0.2 due to actively cooling', () => {
            const startTemp = 19.7;
            const snapshots: Snapshot[] = [
                {
                    when: new Date(2020, 1, 1, 0, 0, 0),
                    value: 26.5,
                    heatingPercentage: 0,
                    coolingPercentage: 1,
                },
                {
                    when: new Date(2020, 1, 1, 0, 15, 0),
                    value: 26.3,
                    heatingPercentage: 0,
                    coolingPercentage: 1,
                },
                {
                    when: new Date(2020, 1, 1, 0, 30, 0),
                    value: 26.1,
                    heatingPercentage: 0,
                    coolingPercentage: 1,
                },
                {
                    when: new Date(2020, 1, 1, 0, 45, 0),
                    value: 25.9,
                    heatingPercentage: 0,
                    coolingPercentage: 1,
                },
            ]
            const cps = TemperatureApproach.make(snapshots, 15, 40, 15, startTemp);

            cps.step(2);
            const actual = startTemp - cps.getCurrentTemp();
            const expected = 0.2;

            expect(actual).to.be.approximately(expected, 0.01);
        });

        it('Should increase temperature with 0.2 due to actively heating', () => {
            const startTemp = 16.7;
            const snapshots: Snapshot[] = [
                {
                    when: new Date(2020, 1, 1, 0, 0, 0),
                    value: 16.6,
                    heatingPercentage: 1,
                    coolingPercentage: 0,
                },
                {
                    when: new Date(2020, 1, 1, 0, 15, 0),
                    value: 16.8,
                    heatingPercentage: 1,
                    coolingPercentage: 0,
                },
                {
                    when: new Date(2020, 1, 1, 0, 30, 0),
                    value: 17.0,
                    heatingPercentage: 1,
                    coolingPercentage: 0,
                },
                {
                    when: new Date(2020, 1, 1, 0, 45, 0),
                    value: 17.2,
                    heatingPercentage: 1,
                    coolingPercentage: 0,
                },
            ]
            const cps = TemperatureApproach.make(snapshots, 15, 40, 15, startTemp);

            cps.step(1);
            const actual = cps.getCurrentTemp() - startTemp;
            const expected = 0.2;

            expect(actual).to.be.approximately(expected, 0.01);
        });

        it('Should hit a maximum heating temp', () => {
            const startTemp = 40;
            const snapshots: Snapshot[] = [
                {
                    when: new Date(2020, 1, 1, 0, 0, 0),
                    value: 16.6,
                    heatingPercentage: 1,
                    coolingPercentage: 0,
                },
                {
                    when: new Date(2020, 1, 1, 0, 15, 0),
                    value: 16.8,
                    heatingPercentage: 1,
                    coolingPercentage: 0,
                },
                {
                    when: new Date(2020, 1, 1, 0, 30, 0),
                    value: 17.0,
                    heatingPercentage: 1,
                    coolingPercentage: 0,
                },
                {
                    when: new Date(2020, 1, 1, 0, 45, 0),
                    value: 17.2,
                    heatingPercentage: 1,
                    coolingPercentage: 0,
                },
            ]
            const cps = TemperatureApproach.make(snapshots, 15, 40, 15, startTemp);

            cps.step(1);
            const actual = cps.getCurrentTemp();
            const expected = 40;

            expect(actual).to.be.equal(expected);
        });

        it('Should hit a minimum cooling temp', () => {
            const startTemp = 15;
            const snapshots: Snapshot[] = [
                {
                    when: new Date(2020, 1, 1, 0, 0, 0),
                    value: 26.5,
                    heatingPercentage: 0,
                    coolingPercentage: 1,
                },
                {
                    when: new Date(2020, 1, 1, 0, 15, 0),
                    value: 26.3,
                    heatingPercentage: 0,
                    coolingPercentage: 1,
                },
                {
                    when: new Date(2020, 1, 1, 0, 30, 0),
                    value: 26.1,
                    heatingPercentage: 0,
                    coolingPercentage: 1,
                },
                {
                    when: new Date(2020, 1, 1, 0, 45, 0),
                    value: 25.9,
                    heatingPercentage: 0,
                    coolingPercentage: 1,
                },
            ]
            const cps = TemperatureApproach.make(snapshots, 15, 40, 15, startTemp);

            cps.step(2);
            const actual = cps.getCurrentTemp();
            const expected = 15;

            expect(actual).to.be.equal(expected);
        });

        it('Should hit a minimum passive cooling temp', () => {
            const startTemp = 15;
            const snapshots: Snapshot[] = [
                {
                    when: new Date(2020, 1, 1, 0, 0, 0),
                    value: 26.5,
                    heatingPercentage: 0,
                    coolingPercentage: 0,
                },
                {
                    when: new Date(2020, 1, 1, 0, 15, 0),
                    value: 26.3,
                    heatingPercentage: 0,
                    coolingPercentage: 0,
                },
                {
                    when: new Date(2020, 1, 1, 0, 30, 0),
                    value: 26.1,
                    heatingPercentage: 0,
                    coolingPercentage: 0,
                },
                {
                    when: new Date(2020, 1, 1, 0, 45, 0),
                    value: 25.9,
                    heatingPercentage: 0,
                    coolingPercentage: 0,
                },
            ]
            const cps = TemperatureApproach.make(snapshots, 15, 40, 15, startTemp);

            cps.step(0);
            const actual = cps.getCurrentTemp();
            const expected = 15;

            expect(actual).to.be.equal(expected);
        });
    });

    describe('RandomizeStart()', () => {
        it('Should generate a random starting tempature', () => {
            const startTemp = 19;
            const cps = TemperatureApproach.make([], 15, 40, 15, startTemp);
            cps.randomizeStart();

            expect(cps.getCurrentTemp()).to.not.equal(startTemp);
        });
    });
});
