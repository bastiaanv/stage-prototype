import * as tf from '@tensorflow/tfjs-node-gpu';
import { Snapshot } from '../domain/snapshot.model';

export interface Learning {
    /**
     * This method can be used to predict the next action using new data
     * @param data Normalized data for the Recurrent Neural Network. First dimention is for time serries, second dimention contains the situational data, like temperature and date/time
     * @returns Promise<Float32Array>. When value is close to 1, the model is saying that that action has to be done. Position 0 -> Do nothing, Position 1 -> Go Heating, Position 2 -> Go Cooling.
     * @returns Promise<Float32Array>. When using the linear regression model, it will return a Float32Array containing one element which contains the predicted temperature
     */
    predict(data: number[][] | Snapshot): Promise<tf.backend_util.TypedArray>;

    /**
     * Loads the model from location: 'ROOT_FOLDER/model/{reinforced | supervised | mlp}'
     * @returns Promise<void>. When no exception has been throw, the training was successful
     */
    load(): Promise<void>;

    /**
     * Saves the model to: 'ROOT_FOLDER/model/{reinforced | supervised | mlp}'
     * @returns Promise<void>. When no exception has been throw, the training was successful
     */
    save(): Promise<void>;

    /**
     * Trains the model using a dataset
     * @param snapshots A Dataset to train on
     * @returns Promse<void>. When no exception has been throw, the training was successful
     */
    train(snapshots: Snapshot[]): Promise<void>;
}
