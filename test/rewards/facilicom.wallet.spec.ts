import 'mocha';
import { expect } from 'chai';
import { FacilicomCoin } from '../../src/rewards/facilicom.coin';
import { FacilicomWallet } from '../../src/rewards/facilicom.wallet';

describe('Facilicom Wallet', () => {
    describe('getTotalValue()', () => {
        it('Should return a value of 2 when there is added 2 positive Facilicom coins', () => {
            const coins: FacilicomCoin[] = [
                new FacilicomCoin(1),
                new FacilicomCoin(1),
            ];

            const wallet = new FacilicomWallet();
            wallet.add(coins);

            const expected = 2;
            const actual = wallet.getTotalValue();

            expect(actual).to.equal(expected);
        });
    });

    describe('getLastValue() {using array}', () => {
        it('Should return a value of 2 when there is added 2 positive Facilicom coins', () => {
            const coins: FacilicomCoin[] = [
                new FacilicomCoin(1),
                new FacilicomCoin(1),
            ];

            const wallet = new FacilicomWallet();
            wallet.add(coins);

            const expected = 2;
            const actual = wallet.getLastValue();

            expect(actual).to.equal(expected);
        });
    });

    describe('getLastValue() {using single coin}', () => {
        it('Should return a value of -1 when there is added 1 negative Facilicom coin', () => {
            const coin = new FacilicomCoin(-1);

            const wallet = new FacilicomWallet();
            wallet.add(coin);

            const expected = -1;
            const actual = wallet.getLastValue();

            expect(actual).to.equal(expected);
        });
    });
});