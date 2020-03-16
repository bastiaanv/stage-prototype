import { Snapshot } from '../models/snapshot.model';
import { Trainer } from './trainer';
import { CyberPhysicalSystem } from './cyber.physical.system.interface';
import { RewardSystem } from '../rewards/reward.system.interface';
import { TemperatureRewardSystem } from '../rewards/temperature.reward.system';
import { FacilicomCoin } from '../rewards/facilicom.coin';

// Formula: Tdot = T - a + Uh * (Tdh + a) + Uc * (Tdc + a)
export class RoomTemperatureApproach implements CyberPhysicalSystem {
    private readonly deltaPasiveCooling:    number; // a
    private readonly deltaActiveHeating:    number; // Tdh
    private readonly deltaActiveCooling:    number; // Tdc
    private readonly heatingTemperature:    number; // Tmaxh
    private readonly coolingTemperature:    number; // Tminc
    private readonly outsideTemp:           number; // Tminp

    private readonly rewardSystems:         RewardSystem[];

    private currentTemp:                    number; // T
    public getCurrentTemp():                number {
        return this.currentTemp;
    }

    public readonly datasetSize:            number;

    private constructor(deltaPasiveCooling: number, outsideTemp: number, deltaActiveHeating: number, deltaActiveCooling: number, initTemp: number, heatingTemp: number, coolingTemp: number, datasetSize: number) {
        this.deltaPasiveCooling = deltaPasiveCooling;
        this.outsideTemp        = outsideTemp;
        this.deltaActiveHeating = deltaActiveHeating;
        this.deltaActiveCooling = deltaActiveCooling;
        this.currentTemp        = initTemp;
        this.datasetSize        = datasetSize;
        this.heatingTemperature = heatingTemp;
        this.coolingTemperature = coolingTemp;

        this.rewardSystems = [
            new TemperatureRewardSystem(),
        ];
    }

    public static make(snapshots: Snapshot[], initTemp: number, outsideTemp: number, heatingTemp: number, coolingTemp: number): CyberPhysicalSystem {
        const deltaPassiveCooling   = Trainer.calculatePassiveCooling(snapshots);
        const deltaActiveHeating    = Trainer.calculateActiveHeating(snapshots);
        const deltaActiveCooling    = Trainer.calculateActiveCooling(snapshots);

        return new RoomTemperatureApproach(deltaPassiveCooling, outsideTemp, deltaActiveHeating, deltaActiveCooling, initTemp, heatingTemp, coolingTemp, snapshots.length);
    }

    public step(actions: number[]): void {
        if (actions.length !== 3) {
            throw new Error('Actions does not match nr of actions available');
        }

        const actionHeating = actions[1];
        const actionCooling = actions[2];

        this.currentTemp =  this.calculatePassiveCooling() +
                            this.calculateActiveHeating(actionHeating) +
                            this.calculateActiveCooling(actionCooling);

        if (actionHeating > 0 && actionCooling === 0 && this.currentTemp > this.heatingTemperature) {
            this.currentTemp = this.heatingTemperature;

        } else if (actionCooling > 0 && actionHeating === 0 && this.currentTemp < this.coolingTemperature) {
            this.currentTemp = this.coolingTemperature;

        } else if (actionCooling === 0 && actionHeating === 0 && this.currentTemp < this.outsideTemp) {
            this.currentTemp = this.outsideTemp;
        }
    }

    public getReward(): FacilicomCoin[] {
        const reward: FacilicomCoin[] = [];
        for (const system of this.rewardSystems) {
            // if (system instanceof TemperatureRewardSystem) {
            reward.push(system.getReward(this.getCurrentTemp()));
            // }
        }

        return reward;
    }

    private calculatePassiveCooling(): number {
        return this.currentTemp - this.deltaPasiveCooling;
    }

    private calculateActiveHeating(actionHeating: number): number {
        return actionHeating * (this.deltaActiveHeating + this.deltaPasiveCooling);
    }

    private calculateActiveCooling(actionCooling: number): number {
        return actionCooling * (this.deltaPasiveCooling - this.deltaActiveCooling);
    }
}