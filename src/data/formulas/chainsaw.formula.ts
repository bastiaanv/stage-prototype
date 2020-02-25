import { Formula } from './formula.interface';

export class Chainsaw implements Formula {
    private readonly deltaPassiveCooling: number;
    private readonly deltaActiveHeating: number;
    private readonly maxValue: number;
    private readonly minValue: number;

    private needHeating = false;
    private previousValue = 0;

    constructor(deltaPassiveCooling: number, deltaActiveHeating: number, maxValue: number, minValue: number, initValue: number) {
        this.deltaPassiveCooling = deltaPassiveCooling;
        this.deltaActiveHeating = deltaActiveHeating;
        this.maxValue = maxValue;
        this.minValue = minValue;

        this.previousValue = initValue;
    }

    public next(): number {
        if (this.previousValue > this.maxValue) {
            this.needHeating = false;
        } else if (this.previousValue < this.minValue) {
            this.needHeating = true;
        }

        let output = 0;
        if (!this.needHeating) {
            output = this.previousValue - this.deltaPassiveCooling;

        } else {
            output = this.previousValue + this.deltaActiveHeating;
        }

        this.previousValue = output;
        return output;
    }

    public isActivelyHeating(): boolean {
        return this.needHeating;
    }

    public isActivelyCooling(): boolean {
        return false;
    }
}
