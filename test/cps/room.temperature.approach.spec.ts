import 'mocha';
import { expect } from 'chai';
import { RoomTemperatureApproach } from '../../src/cps/room.temperature.approach';
import { FacilicomCoin } from '../../src/rewards/facilicom.coin';
import { Snapshot } from '../../src/models/snapshot.model';

describe('Room temperature approach', () => {
    describe('make(snapshots, initTemp, outsideTemp, heatingTemp, coolingTemp)', () => {
        it('Should make a CPS-like class', () => {
            const actual = RoomTemperatureApproach.make([], 0, 0, 0, 0);

            // tslint:disable-next-line: no-unused-expression
            expect(actual).to.be.not.undefined
        });
    });

    describe('getReward()', () => {
        it('Should give a positive reward, because them is between 18 and 20', () => {
            const cps = RoomTemperatureApproach.make([], 19.5, 0, 0, 0);

            const actual = cps.getReward();
            const expected: FacilicomCoin[] = [
                new FacilicomCoin(2)
            ];

            expect(actual).to.be.deep.equal(expected);
        });

        it('Should give a neutral reward, because them is between 16 and 18', () => {
            const cps = RoomTemperatureApproach.make([], 17.5, 0, 0, 0);

            const actual = cps.getReward();
            const expected: FacilicomCoin[] = [
                new FacilicomCoin(0)
            ];

            expect(actual).to.be.deep.equal(expected);
        });

        it('Should give a negative reward, because them is between 18 and 20', () => {
            const cps = RoomTemperatureApproach.make([], 23.5, 0, 0, 0);

            const actual = cps.getReward();
            const expected: FacilicomCoin[] = [
                new FacilicomCoin(-2)
            ];

            expect(actual).to.be.deep.equal(expected);
        });
    });

    describe('step(actions)', () => {
        it('Should throw exception if actions parameters does not match nr of actions in the system', () => {
            const cps = RoomTemperatureApproach.make([], 0, 0, 0, 0);

            // tslint:disable-next-line: no-unused-expression
            expect(() => cps.step([])).to.throw('Actions does not match nr of actions available');
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
            const cps = RoomTemperatureApproach.make(snapshots, startTemp, 15, 40, 15);

            cps.step([1,0,0]);
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
            const cps = RoomTemperatureApproach.make(snapshots, startTemp, 15, 40, 15);

            cps.step([0,0,1]);
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
            const cps = RoomTemperatureApproach.make(snapshots, startTemp, 15, 40, 15);

            cps.step([0,1,0]);
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
            const cps = RoomTemperatureApproach.make(snapshots, startTemp, 0, 40, 0);

            cps.step([0,1,0]);
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
            const cps = RoomTemperatureApproach.make(snapshots, startTemp, 0, 0, 15);

            cps.step([0,0,1]);
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
            const cps = RoomTemperatureApproach.make(snapshots, startTemp, 15, 0, 0);

            cps.step([1,0,0]);
            const actual = cps.getCurrentTemp();
            const expected = 15;

            expect(actual).to.be.equal(expected);
        });
    });
});
