import 'mocha';
import { expect } from 'chai';
import { Chainsaw } from '../../../src/data/formulas/chainsaw.formula';

describe('Chainsaw formula', () => {
    describe('next()', () => {
        it('Should decrease with 0.2 due to passive cooling', () => {
            const formula = new Chainsaw(0.2, 0.5, 0.4, 24, 18, 20, 19.5, false, true);

            const actual = formula.next();
            const expected = 19.3;

            expect(actual).to.be.equals(expected);
            // tslint:disable-next-line: no-unused-expression
            expect(formula.isActivelyCooling()).to.be.false;
            // tslint:disable-next-line: no-unused-expression
            expect(formula.isActivelyHeating()).to.be.false;
        });

        it('Should decrease with 0.4 due to active cooling', () => {
            const formula = new Chainsaw(0.2, 0.5, 0.4, 24, 18, 20, 24.5, false, false);

            const actual = formula.next();
            const expected = 24.1;

            expect(actual).to.be.equals(expected);
            // tslint:disable-next-line: no-unused-expression
            expect(formula.isActivelyCooling()).to.be.true;
            // tslint:disable-next-line: no-unused-expression
            expect(formula.isActivelyHeating()).to.be.false;
        });

        it('Should increase with 0.5 due to active heating', () => {
            const formula = new Chainsaw(0.2, 0.5, 0.4, 24, 18, 20, 17.4);

            const actual = formula.next();
            const expected = 17.9;

            expect(actual).to.be.equals(expected);
            // tslint:disable-next-line: no-unused-expression
            expect(formula.isActivelyCooling()).to.be.false;
            // tslint:disable-next-line: no-unused-expression
            expect(formula.isActivelyHeating()).to.be.true;
        });
    });
});
