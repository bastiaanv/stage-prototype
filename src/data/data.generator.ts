import { Snapshot } from '../domain/snapshot.model';
import { Chainsaw } from './formulas/chainsaw.formula';

export class DataGenerator {

    // Per day 96 quarters (15 minutes)
    public static generateLinearData(countQuarters: number): Snapshot[] {
        const output: Snapshot[] = [];

        // Start time is today at 00:00 AM
        const time = new Date();
        time.setUTCHours(0, 0, 0, 0);

        // Chainsaw like formula is used for the linear data. The temp at 00:00 is 19.5 degree
        const formula = new Chainsaw(0.05, 0.25, 0.3, 24, 18, 20, 19.5);
        for (let i = 0; i < countQuarters; i++) {
            output.push({
                when: new Date(time.getTime()),
                temperature: formula.next(),
                outsideTemperature: 19,
                heatingPercentage: formula.isActivelyHeating() ? 1 : 0,
                coolingPercentage: formula.isActivelyCooling() ? 1 : 0,
            });

            time.setUTCMinutes(time.getMinutes() + 15);
        }

        return output;
    }
}