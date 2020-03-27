import * as tf from '@tensorflow/tfjs-node-gpu';
import { Snapshot } from '../domain/snapshot.model';

export interface Learning {
    predict(temp: number): Promise<tf.backend_util.TypedArray>;
    save(): Promise<void>;
    train(snapshots: Snapshot[]): Promise<void>;
}
