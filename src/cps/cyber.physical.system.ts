import { Snapshot } from '../domain/snapshot.model';
import { Normalization } from '../math/normalization.math';
import { RewardSystem } from '../reward/reward.system';
import { MemoryCPS, MemoryData } from './memory.cyber.physical.system';
import { TemperatureApproach } from '../tensorflow/temperature.approach';

export class CyberPhysicalSystem {
    private readonly memory                 = new MemoryCPS();
    private readonly historicData           : Snapshot[];
    public static readonly nrOfDataPoints   = 4;

    private currentTemp:                    number = 0; // T
    private currentDate:                    Date = new Date();
    private readonly model:                 TemperatureApproach;

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
            Normalization.temperature(this.historicData.find(x => x.when.getTime() === this.currentDate.getTime())!.outside!.temperature),
            Normalization.time(this.currentDate),
            Normalization.date(this.currentDate),
        ];
    }

    // private readonly rewardSystemTemperature =  new TemperatureReward();
    private readonly rewardSystemControl =      new RewardSystem();

    private constructor(model: TemperatureApproach, snapshots: Snapshot[]) {
        this.model = model;
        this.historicData = snapshots;
    }

    public static async make(snapshots: Snapshot[], loadModel: boolean): Promise<CyberPhysicalSystem> {
        const model = new TemperatureApproach();
        if (!loadModel) {
            await model.train(snapshots)
            await model.save();
        
        } else {
            await model.load();
        }

        return new CyberPhysicalSystem(model, snapshots);
    }

    public async step(action: number): Promise<void> {
        if (action > 3) {
            throw new Error('Action does not match actions available...');
        }

        // Save to memory
        this.memory.add({
            date: new Date(this.currentDate.getTime()),
            temperature: this.currentTemp,
            outsideTemperature: this.historicData.find(x => x.when.getTime() === this.currentDate.getTime())!.outside!.temperature,
            action,
        });

        // Calculate new temperature
        const index = this.historicData.findIndex(x => x.when.getTime() === this.currentDate.getTime());
        const data: Snapshot = {
            temperature: this.currentTemp,
            when: new Date(this.currentDate.getTime()),
            occupied: false,
            coolingPercentage: action === 2 ? 1 : 0,
            heatingPercentage: action === 1 ? 1 : 0,
            outside: this.historicData[index].outside!,
        }
        const preData: Snapshot = this.historicData[index-1];
        const prePreData: Snapshot = this.historicData[index-2];
        this.currentTemp = (await this.model.predict(data, preData.temperature, prePreData.temperature))[0];
        console.log(data);
        console.log(this.currentTemp);

        // Increase time with 15 minutes
        this.currentDate.setMinutes(this.currentDate.getMinutes() + 15);
    }

    public getReward(): number {
        let reward = 0;

        // Give reward for action taken upon previous temperature
        const lastData = this.getLastData();
        reward += this.rewardSystemControl.getReward(lastData.temperature, lastData.action, lastData.date);

        // Normalize and return
        return Normalization.reward(reward, 1);
    }

    public async start(timeSerieLength: number): Promise<void> {
        // Setup init values (temperature and dateTime)
        const date = new Date(this.historicData[2].when.getTime());

        this.currentDate = date;
        this.currentTemp = Math.random() * 10 + 15;

        // Fill memory with init data
        for (let i = 0; i < timeSerieLength; i++) {
            await this.step(0);
        }
    }
}
