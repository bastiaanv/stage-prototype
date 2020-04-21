import * as tf from '@tensorflow/tfjs-node-gpu';
import { Snapshot } from '../domain/snapshot.model';

export interface Learning {
    /**
     * This method can be used to predict the next action using new data
     * @param data Normalized data for the Recurrent Neural Network. First dimention is for time serries, second dimention contains the situational data, like temperature and date/time
     * @returns Promise<Float32Array>. When value is close to 1, the RNN is saying that that action has to be done. Position 0 -> Do nothing, Position 1 -> Go Heating, Position 2 -> Go Cooling.
     */
    predict(data: number[][]): Promise<tf.backend_util.TypedArray>;

    /**
     * Loads the RNN from location: 'ROOT_FOLDER/model'
     * @returns Promise<void>
     */
    load(): Promise<void>;

    /**
     * Saves the RNN to: 'ROOT_FOLDER/model'
     * @returns Promise<void>
     */
    save(): Promise<void>;

    /**
     * Trains the RNN using a self generated dataset
     * @param snapshots A Dataset to train on
     * @returns Promse<void>
     */
    train(snapshots: Snapshot[]): Promise<void>;
}
