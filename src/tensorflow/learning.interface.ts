import * as tf from '@tensorflow/tfjs-node-gpu';
import { Snapshot } from '../domain/snapshot.model';

export interface Learning {
    predict(data: number[][]): Promise<tf.backend_util.TypedArray>;
    load(): Promise<void>;
    save(): Promise<void>;
    train(snapshots: Snapshot[]): Promise<void>;
}
