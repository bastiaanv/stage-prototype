import { TemperatureReward } from '../reward/temperature.reward';
import { Snapshot } from '../domain/snapshot.model';
import { Normalization } from '../math/normalization.math';
import { Trainer } from '../math/trainer.math';
import { ControlReward } from '../reward/control.reward';

// Formula: Tdot = T - a + Uh * (Tdh + a) + Uc * (Tdc + a)
export class TemperatureApproach {
    private readonly deltaPasiveCooling:    number;     // a
    private readonly deltaActiveHeating:    number;     // Tdh
    private readonly deltaActiveCooling:    number;     // Tdc
    private readonly heatingTemperature:    number;     // Tmaxh
    private readonly coolingTemperature:    number;     // Tminc
    private readonly outsideTemp:           number;     // Tminp

    private currentTemp:                    number = 0; // T
    public getCurrentTemp():                number {
        return this.currentTemp;
    }

    private lastAction:                     number = 0;
    private lastTemperature:                number = 0;

    private readonly rewardSystemTemperature =  new TemperatureReward();
    private readonly rewardSystemControl =      new ControlReward();

    private constructor(deltaPasiveCooling: number, outsideTemp: number, deltaActiveHeating: number, deltaActiveCooling: number, heatingTemp: number, coolingTemp: number) {
        this.deltaPasiveCooling = deltaPasiveCooling;
        this.outsideTemp        = outsideTemp;
        this.deltaActiveHeating = deltaActiveHeating;
        this.deltaActiveCooling = deltaActiveCooling;
        this.heatingTemperature = heatingTemp;
        this.coolingTemperature = coolingTemp;
    }

    public static make(snapshots: Snapshot[], outsideTemp: number, heatingTemp: number, coolingTemp: number): TemperatureApproach {
        const deltaPassiveCooling   = Trainer.calculatePassiveCooling(snapshots);
        const deltaActiveHeating    = Trainer.calculateActiveHeating(snapshots);
        const deltaActiveCooling    = Trainer.calculateActiveCooling(snapshots);

        return new TemperatureApproach(deltaPassiveCooling, outsideTemp, deltaActiveHeating, deltaActiveCooling, heatingTemp, coolingTemp);
    }

    public step(action: number): void {
        if (action > 3) {
            throw new Error('Action does not match actions available...');
        }

        this.lastAction = action;
        this.lastTemperature = this.currentTemp;
        this.currentTemp =  this.calculatePassiveCooling() +
                            this.calculateActiveHeating(action === 1) +
                            this.calculateActiveCooling(action === 2);

        if (action === 1 && this.currentTemp > this.heatingTemperature) {
            this.currentTemp = this.heatingTemperature;

        } else if (action === 2 && this.currentTemp < this.coolingTemperature) {
            this.currentTemp = this.coolingTemperature;

        } else if (action === 0 && this.currentTemp < this.outsideTemp) {
            this.currentTemp = this.outsideTemp;
        }
    }

    public getReward(): number {
        let reward = 0;

        // Give reward for current temperature
        reward += this.rewardSystemTemperature.getReward(this.currentTemp);

        // Give reward for action taken upon previous temperature
        reward += this.rewardSystemControl.getReward(this.lastTemperature, this.lastAction)

        // Normalize and return
        return Normalization.reward(reward, 2);
    }

    public randomizeStart(): void {
        this.currentTemp = Math.random() * 10 + 15;
    }

    private calculatePassiveCooling(): number {
        return this.currentTemp - this.deltaPasiveCooling;
    }

    private calculateActiveHeating(actionHeating: boolean): number {
        return (actionHeating ? 1 : 0) * (this.deltaActiveHeating + this.deltaPasiveCooling);
    }

    private calculateActiveCooling(actionCooling: boolean): number {
        return (actionCooling ? 1 : 0) * (this.deltaPasiveCooling - this.deltaActiveCooling);
    }
}
