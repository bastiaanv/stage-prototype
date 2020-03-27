import { CyberPhysicalSystem } from './cyber.physical.system.interface';
import { RewardSystem } from '../reward/reward.interface';
import { TemperatureReward } from '../reward/temperature.reward';
import { Snapshot } from '../domain/snapshot.model';
import { Normalization } from '../math/normalization.math';
import { Trainer } from '../math/trainer.math';

// Formula: Tdot = T - a + Uh * (Tdh + a) + Uc * (Tdc + a)
export class TemperatureApproach implements CyberPhysicalSystem {
    private readonly deltaPasiveCooling:    number; // a
    private readonly deltaActiveHeating:    number; // Tdh
    private readonly deltaActiveCooling:    number; // Tdc
    private readonly heatingTemperature:    number; // Tmaxh
    private readonly coolingTemperature:    number; // Tminc
    private readonly outsideTemp:           number; // Tminp

    private readonly rewardSystems:         RewardSystem[];

    private lastAction:                     number = 0;

    private currentTemp:                    number; // T
    public getCurrentTemp():                number {
        return this.currentTemp;
    }

    private constructor(deltaPasiveCooling: number, outsideTemp: number, deltaActiveHeating: number, deltaActiveCooling: number, initTemp: number, heatingTemp: number, coolingTemp: number) {
        this.deltaPasiveCooling = deltaPasiveCooling;
        this.outsideTemp        = outsideTemp;
        this.deltaActiveHeating = deltaActiveHeating;
        this.deltaActiveCooling = deltaActiveCooling;
        this.currentTemp        = initTemp;
        this.heatingTemperature = heatingTemp;
        this.coolingTemperature = coolingTemp;

        this.rewardSystems = [
            new TemperatureReward(),
        ];
    }

    public static make(snapshots: Snapshot[], outsideTemp: number, heatingTemp: number, coolingTemp: number, initTemp?: number): CyberPhysicalSystem {
        const deltaPassiveCooling   = Trainer.calculatePassiveCooling(snapshots);
        const deltaActiveHeating    = Trainer.calculateActiveHeating(snapshots);
        const deltaActiveCooling    = Trainer.calculateActiveCooling(snapshots);

        return new TemperatureApproach(deltaPassiveCooling, outsideTemp, deltaActiveHeating, deltaActiveCooling, !!initTemp ? initTemp : (Math.random() * 10 + 15), heatingTemp, coolingTemp);
    }

    public step(action: number): void {
        if (action > 3) {
            throw new Error('Action does not match actions available...');
        }

        this.lastAction = action;
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
        const reward: number[] = [];
        for (const system of this.rewardSystems) {
            // if (system instanceof TemperatureReward) {
            reward.push(system.getReward(this.getCurrentTemp(), this.lastAction));
            // }
        }

        return Normalization.reward(reward.reduce((a, b) => a + b, 0), this.rewardSystems.length);
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