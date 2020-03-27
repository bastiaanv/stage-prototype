import * as tf from '@tensorflow/tfjs-node-gpu';
import { resolve } from 'path';
import { Learning } from './learning.interface';

export class SupervisedLearning implements Learning {
    private readonly pathToModel = 'file://' + resolve(__dirname, '..', '..', 'model');
    private readonly model: tf.LayersModel;

    constructor() {
        const input = tf.input({shape: [1]});
        const dense1 = tf.layers.dense({units: 10, activation: 'relu'}).apply(input);
        const dense2 = tf.layers.dense({units: 10, activation: 'relu'}).apply(dense1);
        const dense3 = tf.layers.dense({units: 3, activation: 'softmax', name: 'output'}).apply(dense2) as tf.SymbolicTensor;
        this.model = tf.model({inputs: input, outputs: dense3});

        this.model.compile({
            optimizer: tf.train.adam(),
            metrics: [tf.metrics.categoricalAccuracy],
            loss: tf.metrics.categoricalCrossentropy,
        });
    }

    public predict(temp: number): Promise<tf.backend_util.TypedArray> {
        return (this.model.predict(tf.tensor([this.normalize(temp)])) as tf.Tensor).data();
    }

    public async save(): Promise<void> {
        await this.model.save(this.pathToModel);
    }

    public async train(): Promise<void> {
        await this.model.fitDataset(
            this.generateDataAndLabels(),
            { epochs: 600, verbose: 1 }
        );
    }

    private generateDataAndLabels() {
        const dataset: {xs: tf.Tensor, ys: tf.Tensor}[] = [];
        for (let temperature = 12; temperature < 24; temperature += 0.1) {
            dataset.push({
                xs: tf.tensor([this.normalize(temperature)]),
                ys: tf.tensor([temperature > 16 && temperature < 20 ? 1 : 0, temperature < 16 ? 1 : 0, temperature > 20 ? 1 : 0])
            });
        }

        return tf.data.array(dataset).repeat(3).shuffle(120, undefined, true).batch(60);
    }

    private normalize(x: number): number {
        return (x + 20) / 60;
    }
}
