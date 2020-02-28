import { Formula } from './formula.interface';

export class Chainsaw implements Formula {
    private readonly deltaPassiveCooling: number;
    private readonly deltaActiveHeating: number;
    private readonly deltaActiveCooling: number;
    private readonly maxValue: number;
    private readonly midValue: number;
    private readonly minValue: number;

    private needHeating = false;
    private needCooling = false;
    private previousValue = 0;

/* formula form:

24  |               /\                 /
    |              /  \               /
    |             /    \             /
20  |_           /      \           /
    | -_        /        -_        /
    |   -_     /           -_     /
    |     -_  /              -_  /
18  |_______-__________________-________
*/

    constructor(deltaPassiveCooling: number, deltaActiveHeating: number, deltaActiveCooling: number, maxValue: number, minValue: number, initValue: number) {
        this.deltaPassiveCooling = deltaPassiveCooling;
        this.deltaActiveHeating = deltaActiveHeating;
        this.deltaActiveCooling = deltaActiveCooling;
        this.maxValue = maxValue;
        this.midValue = initValue;
        this.minValue = minValue;

        this.previousValue = initValue;
    }

    public next(): number {
        if (this.previousValue > this.maxValue) {
            this.needHeating = false;
            this.needCooling = true;
        } else if (this.previousValue < this.midValue && !this.needHeating && this.needCooling) {
            this.needHeating = false;
            this.needCooling = false;
        } else if (this.previousValue < this.minValue && !this.needCooling && !this.needHeating) {
            this.needHeating = true;
            this.needCooling = false;
        }

        let output = 0;
        if (!this.needHeating && !this.needCooling) {
            output = this.previousValue - this.deltaPassiveCooling;

        } else if (this.needCooling && !this.needHeating) {
            output = this.previousValue - this.deltaActiveCooling;

        } else if (this.needHeating && !this.needCooling) {
            output = this.previousValue + this.deltaActiveHeating;
        }

        this.previousValue = output;
        return output;
    }

    public isActivelyHeating(): boolean {
        return this.needHeating;
    }

    public isActivelyCooling(): boolean {
        return this.needCooling;
    }
}
