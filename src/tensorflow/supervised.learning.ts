import * as tf from '@tensorflow/tfjs-node-gpu';
import { resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { Learning } from './learning.interface';
import { Normalization } from '../math/normalization.math';
import { Snapshot } from '../domain/snapshot.model';

export class SupervisedLearning implements Learning {
    private readonly pathToModel = 'file://model/supervised';
    private readonly pathAbsolute = resolve(__dirname, '..', '..', 'model', 'supervised');
    private readonly nrOfInputs: number = 1;
    private readonly nrOfActions: number = 3;
    private readonly timeSeries: number = 8;

    private model: tf.LayersModel;

    constructor() {
        const input = tf.input({shape: [this.timeSeries, this.nrOfInputs], name: 'Input'});
        const lstm1 = tf.layers.lstm({units: 8, activation: 'relu',}).apply(input);
        const output = tf.layers.dense({units: this.nrOfActions, activation: 'softmax', name: 'output'}).apply(lstm1) as tf.SymbolicTensor;
        this.model = tf.model({inputs: input, outputs: output});

        this.model.compile({
            optimizer: tf.train.adam(),
            metrics: [tf.metrics.categoricalAccuracy],
            loss: tf.metrics.categoricalCrossentropy,
        });
    }

    public async save(): Promise<void> {
        if (!existsSync(this.pathAbsolute)) {
            mkdirSync(this.pathAbsolute, { recursive: true });
        }

        await this.model.save(this.pathToModel);
    }

    public async load(): Promise<void> {
        this.model = await tf.loadLayersModel(this.pathToModel + '/model.json');
    }

    public predict(data: number[][]): Promise<tf.backend_util.TypedArray> {
        if (data.length !== this.timeSeries) {
            throw new Error('Not enough or too much historical data given to do prediction');
        }

        for(const value of data) {
            if (value.length !== this.nrOfInputs) {
                throw new Error('Not enough or too much data given to do prediction');
            }
        }

        return (this.model.predict(tf.tensor([data])) as tf.Tensor).data();
    }

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
                    [Normalization.temperature(temperature-0.7)],
                    [Normalization.temperature(temperature-0.6)],
                    [Normalization.temperature(temperature-0.5)],
                    [Normalization.temperature(temperature-0.4)],
                    [Normalization.temperature(temperature-0.3)],
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
