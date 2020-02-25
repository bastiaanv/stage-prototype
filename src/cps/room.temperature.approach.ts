import { Snapshot } from '../models/snapshot.model';
import { Trainer } from './trainer';
import { CyberPhysicalSystem } from './cyber.physical.system.interface';

export class RoomTemperatureApproach implements CyberPhysicalSystem {
    private readonly deltaPasiveCooling: number;
    private readonly deltaActiveHeating: number;
    private readonly deltaActiveCooling: number;
    private readonly heatingTemperature: number;
    private readonly coolingTemperature: number;
    private readonly outsideTemp: number;

    private currentTemp: number;
    public getCurrentTemp(): number {
        return this.currentTemp;
    }

    public readonly datasetSize: number;

    private constructor(deltaPasiveCooling: number, outsideTemp: number, deltaActiveHeating: number, deltaActiveCooling: number, initTemp: number, heatingTemp: number, coolingTemp: number, datasetSize: number) {
        this.deltaPasiveCooling = deltaPasiveCooling;
        this.outsideTemp        = outsideTemp;
        this.deltaActiveHeating = deltaActiveHeating;
        this.deltaActiveCooling = deltaActiveCooling;
        this.currentTemp        = initTemp;
        this.datasetSize        = datasetSize;
        this.heatingTemperature = heatingTemp;
        this.coolingTemperature = coolingTemp;
    }

    public static make(snapshots: Snapshot[], initTemp: number, outsideTemp: number, heatingTemp: number, coolingTemp: number): CyberPhysicalSystem {
        const deltaPassiveCooling   = Trainer.calculatePassiveCooling(snapshots);
        const deltaActiveHeating    = Trainer.calculateActiveHeating(snapshots);
        const deltaActiveCooling    = Trainer.calculateActiveCooling(snapshots);

        return new RoomTemperatureApproach(deltaPassiveCooling, outsideTemp, deltaActiveHeating, deltaActiveCooling, initTemp, heatingTemp, coolingTemp, snapshots.length);
    }

    public step(actionHeating: number, actionCooling: number): void {
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