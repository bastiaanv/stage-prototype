import * as tf from '@tensorflow/tfjs-node-gpu';
import { Snapshot } from '../domain/snapshot.model';

export interface Learning {
    predict(temp: number, date: Date): Promise<tf.backend_util.TypedArray>;
    load(): Promise<void>;
    save(): Promise<void>;
    train(snapshots: Snapshot[]): Promise<void>;
}
