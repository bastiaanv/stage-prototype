import * as tf from '@tensorflow/tfjs-node-gpu';

export interface Learning {
    predict(temp: number): Promise<tf.backend_util.TypedArray>;
    save(): Promise<void>;
    train(): Promise<void>;
}
