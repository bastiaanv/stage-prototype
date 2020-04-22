import { Snapshot } from '../domain/snapshot.model';
import { Normalization } from '../math/normalization.math';
import { Trainer } from '../math/trainer.math';
import { RewardSystem } from '../reward/reward.system';
import { MemoryCPS, MemoryData } from './memory.cyber.physical.system';

// Formula: Tdot = T - a + Uh * (Tdh + a) + Uc * (Tdc + a)
export class CyberPhysicalSystem {
    private readonly memory                 = new MemoryCPS();
    private readonly historicData           : Snapshot[];

    private readonly deltaPasiveCooling:    number;     // a
    private readonly deltaActiveHeating:    number;     // Tdh
    private readonly deltaActiveCooling:    number;     // Tdc
    private readonly heatingTemperature:    number;     // Tmaxh
    private readonly coolingTemperature:    number;     // Tminc
    private readonly outsideTemp:           number;     // Tminp
    private currentTemp:                    number = 0; // T
    private currentDate:                    Date = new Date();

    private getLastData():                  MemoryData {
        return this.memory.getLastData(1)[0];
    }

    public getDataFromMemory(count: number): number[][] {
        return this.memory.getLastData(count).map(x => [
            Normalization.temperature(x.temperature),
            Normalization.temperature(x.outsideTemperature),
            Normalization.time(x.date),
            Normalization.date(x.date),
        ]);
    }

    public getCurrentData():                number[] {
        return [
            Normalization.temperature(this.currentTemp),
            Normalization.time(this.currentDate),
            Normalization.date(this.currentDate),
        ];
    }

    // private readonly rewardSystemTemperature =  new TemperatureReward();
    private readonly rewardSystemControl =      new RewardSystem();

    private constructor(deltaPasiveCooling: number, outsideTemp: number, deltaActiveHeating: number, deltaActiveCooling: number, heatingTemp: number, coolingTemp: number, snapshots: Snapshot[]) {
        this.deltaPasiveCooling = deltaPasiveCooling;
        this.outsideTemp        = outsideTemp;
        this.deltaActiveHeating = deltaActiveHeating;
        this.deltaActiveCooling = deltaActiveCooling;
        this.heatingTemperature = heatingTemp;
        this.coolingTemperature = coolingTemp;
        this.historicData = snapshots;
    }

    public static make(snapshots: Snapshot[], outsideTemp: number, heatingTemp: number, coolingTemp: number): CyberPhysicalSystem {
        const deltaPassiveCooling   = Trainer.calculatePassiveCooling(snapshots);
        const deltaActiveHeating    = Trainer.calculateActiveHeating(snapshots);
        const deltaActiveCooling    = Trainer.calculateActiveCooling(snapshots);

        return new CyberPhysicalSystem(deltaPassiveCooling, outsideTemp, deltaActiveHeating, deltaActiveCooling, heatingTemp, coolingTemp, snapshots);
    }

    public step(action: number): void {
        if (action > 3) {
            throw new Error('Action does not match actions available...');
        }
        console.log(this.currentDate)
        console.log(this.historicData.find(x => x.when.getTime() === this.currentDate.getTime()))
        // Save to memory
        this.memory.add({
            date: new Date(this.currentDate.getTime()),
            temperature: this.currentTemp,
            outsideTemperature: this.historicData.find(x => x.when.getTime() === this.currentDate.getTime())!.outsideTemperature,
            action,
        });

        // Calculate new temperature
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

        // Increase time with 8 minutes
        this.currentDate.setMinutes(this.currentDate.getMinutes() + 8);
    }

    public getReward(): number {
        let reward = 0;

        // Give reward for action taken upon previous temperature
        const lastData = this.getLastData();
        reward += this.rewardSystemControl.getReward(lastData.temperature, lastData.action, lastData.date);

        // Normalize and return
        return Normalization.reward(reward, 1);
    }

    public start(timeSerieLength: number): void {
        // Setup init values (temperature and dateTime)
        const date = new Date(this.historicData[0].when.getTime());

        this.currentDate = date;
        this.currentTemp = Math.random() * 10 + 15;

        // Fill memory with init data
        for (let i = 0; i < timeSerieLength; i++) {
            this.step(0);
        }
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
