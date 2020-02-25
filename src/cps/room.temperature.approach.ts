import { Snapshot } from '../models/snapshot.model';
import { Trainer } from './trainer';
import { CyberPhysicalSystem } from './cyber.physical.system.interface';

export class RoomTemperatureApproach implements CyberPhysicalSystem {
    private readonly deltaPasiveCooling: number;
    private readonly deltaActiveHeating: number;
    private readonly deltaActiveCooling: number;
    private readonly minTemp: number;

    private currentTemp: number;
    public getCurrentTemp(): number {
        return this.currentTemp;
    }

    private constructor(deltaPasiveCooling: number, minTemp: number, deltaActiveHeating: number, deltaActiveCooling: number, initTemp: number) {
        this.deltaPasiveCooling = deltaPasiveCooling;
        this.minTemp = minTemp;
        this.deltaActiveHeating = deltaActiveHeating;
        this.deltaActiveCooling = deltaActiveCooling;
        this.currentTemp = initTemp;
    }

    public static make(snapshots: Snapshot[], initTemp: number, minTemp: number): CyberPhysicalSystem {
        const deltaPassiveCooling = Trainer.calculatePassiveCooling(snapshots);
        const deltaActiveHeating = Trainer.calculateActiveHeating(snapshots);
        const deltaActiveCooling = Trainer.calculateActiveCooling(snapshots);

        return new RoomTemperatureApproach(deltaPassiveCooling, minTemp, deltaActiveHeating, deltaActiveCooling, initTemp);
    }

    public step(actionHeating: number, actionCooling: number): void {
        this.currentTemp = -this.deltaPasiveCooling * this.currentTemp +
                            this.minTemp +
                            this.deltaActiveHeating * actionHeating -
                            this.deltaActiveCooling * actionCooling;
    }
}