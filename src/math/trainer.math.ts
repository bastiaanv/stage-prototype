import { Snapshot } from '../domain/snapshot.model';

export class Trainer {
    public static calculatePassiveCooling(snapshots: Snapshot[]): number {
        const deltaValues: number[] = [];
        for(let i = 0; i < snapshots.length-1; i++) {

            const snapshot = snapshots[i];
            if (snapshot.heatingPercentage === 0 && snapshot.coolingPercentage === 0) {
                const deltaValue = snapshots[i+1].temperature - snapshot.temperature;
                deltaValues.push(deltaValue);
            }
        }

        return deltaValues.length === 0 ? 0 : Math.abs(deltaValues.reduce((a, b) => a + b, 0) / deltaValues.length);
    }

    public static calculateActiveHeating(snapshots: Snapshot[]): number {
        const deltaValues: number[] = [];
        for(let i = 0; i < snapshots.length-1; i++) {

            const snapshot = snapshots[i];
            if (snapshot.heatingPercentage > 0 && snapshot.coolingPercentage === 0) {
                const deltaValue = snapshots[i+1].temperature - snapshot.temperature;
                deltaValues.push(deltaValue);
            }
        }

        return deltaValues.length === 0 ? 0 : Math.abs(deltaValues.reduce((a, b) => a + b, 0) / deltaValues.length);
    }

    public static calculateActiveCooling(snapshots: Snapshot[]): number {
        const deltaValues: number[] = [];
        for(let i = 0; i < snapshots.length-1; i++) {

            const snapshot = snapshots[i];
            if (snapshot.heatingPercentage === 0 && snapshot.coolingPercentage > 0) {
                const deltaValue = snapshots[i+1].temperature - snapshot.temperature;
                deltaValues.push(deltaValue);
            }
        }

        return deltaValues.length === 0 ? 0 : Math.abs(deltaValues.reduce((a, b) => a + b, 0) / deltaValues.length);
    }
}
