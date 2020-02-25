import { Snapshot } from '../models/snapshot.model';

export class Trainer {
    public static calculatePassiveCooling(snapshots: Snapshot[]): number {
        const deltaValues: Array<number> = [];
        for(let i = 0; i < snapshots.length-1; i++) {

            const snapshot = snapshots[i];
            if (snapshot.heatingPercentage == 0 && snapshot.coolingPercentage == 0) {
                const deltaValue = snapshots[i+1].value - snapshot.value;
                deltaValues.push(deltaValue);
            }
        }

        return deltaValues.length == 0 ? 0 : (deltaValues.reduce((a, b) => a + b, 0) / deltaValues.length);
    }

    public static calculateActiveHeating(snapshots: Snapshot[]): number {
        const deltaValues: Array<number> = [];
        for(let i = 0; i < snapshots.length-1; i++) {

            const snapshot = snapshots[i];
            if (snapshot.heatingPercentage > 0 && snapshot.coolingPercentage == 0) {
                const deltaValue = snapshots[i+1].value - snapshot.value;
                deltaValues.push(deltaValue);
            }
        }

        return deltaValues.length == 0 ? 0 : (deltaValues.reduce((a, b) => a + b, 0) / deltaValues.length);
    }

    public static calculateActiveCooling(snapshots: Snapshot[]): number {
        const deltaValues: Array<number> = [];
        for(let i = 0; i < snapshots.length-1; i++) {

            const snapshot = snapshots[i];
            if (snapshot.heatingPercentage == 0 && snapshot.coolingPercentage > 0) {
                const deltaValue = snapshots[i+1].value - snapshot.value;
                deltaValues.push(deltaValue);
            }
        }

        return deltaValues.length == 0 ? 0 : (deltaValues.reduce((a, b) => a + b, 0) / deltaValues.length);
    }
}