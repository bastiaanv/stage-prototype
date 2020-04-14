import * as tf from '@tensorflow/tfjs-node-gpu';
import { resolve } from 'path';
import { Learning } from './learning.interface';
import { Normalization } from '../math/normalization.math';
import { Snapshot } from '../domain/snapshot.model';

export class SupervisedLearning implements Learning {
    private readonly pathToModel = 'file://model';
    private model: tf.LayersModel;

    constructor() {
        const input = tf.input({shape: [3, 1], name: 'Input'});
        const lstm1 = tf.layers.lstm({units: 8, activation: 'relu',}).apply(input);
        const output = tf.layers.dense({units: 3, activation: 'softmax', name: 'output'}).apply(lstm1) as tf.SymbolicTensor;
        this.model = tf.model({inputs: input, outputs: output});

        this.model.compile({
            optimizer: tf.train.adam(),
            metrics: [tf.metrics.categoricalAccuracy],
            loss: tf.metrics.categoricalCrossentropy,
        });
    }

    /**
     * Saves the RNN to: 'ROOT_FOLDER/model'
     * @returns Promise<void>
     */
    public async save(): Promise<void> {
        await this.model.save(this.pathToModel);
    }

    /**
     * Loads the RNN from location: 'ROOT_FOLDER/model'
     * @returns Promise<void>
     */
    public async load(): Promise<void> {
        this.model = await tf.loadLayersModel(this.pathToModel + '/model.json');
    }

    /**
     * This method can be used to predict the next action using new data
     * @param data Normalized data for the Recurrent Neural Network. First dimention is for time serries, second dimention contains the situational data, like temperature
     * @returns Promise<Float32Array>. When value is close to 1, the RNN is saying that that action has to be done. Position 0 -> Do nothing, Position 1 -> Go Heating, Position 2 -> Go Cooling.
     */
    public predict(data: number[][]): Promise<tf.backend_util.TypedArray> {
        return (this.model.predict(tf.tensor([data])) as tf.Tensor).data();
    }

    /**
     * Trains the RNN using a self generated dataset
     * @param snapshots A Dataset to train on. NOTE: THIS PARAMETER IS NOT USED IN THE SUPERVISED MACHINE LEARNING MODEL. PLEASE ENTER AN EMPTY ARRAY HERE
     * @returns Promse<void>
     */
    public async train(snapshots: Snapshot[]): Promise<void> {
        await this.model.fitDataset(
            this.generateDataAndLabels(),
            {
                epochs: 600,
                verbose: 1,
                callbacks: tf.node.tensorBoard(resolve(__dirname, '..', '..', 'tensorboard', 'logs')),
            }
        );
    }

    private generateDataAndLabels() {
        const dataset: {xs: tf.Tensor, ys: tf.Tensor}[] = [];
        for (let temperature = 12; temperature < 24; temperature += 0.1) {
            dataset.push({
                xs: tf.tensor([
                    [Normalization.temperature(temperature-0.2)],
                    [Normalization.temperature(temperature-0.1)],
                    [Normalization.temperature(temperature)],
                ]),
                ys: tf.tensor([temperature > 18 && temperature < 20 ? 1 : 0, temperature < 18 ? 1 : 0, temperature > 20 ? 1 : 0])
            });
        }

        return tf.data.array(dataset).repeat(3).shuffle(120, undefined, true).batch(60);
    }
}
