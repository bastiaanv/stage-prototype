import * as tf from '@tensorflow/tfjs-node-gpu';
import { Snapshot } from '../domain/snapshot.model';
import { Learning } from './learning.interface';
import { resolve } from 'path';

/**
 * Uses MLP to approach the new room temperature.
 */
export class TemperatureApproach implements Learning {
    private readonly path = 'file://model/mlp';
    private model: tf.LayersModel;

    constructor() {
        this.model = tf.sequential({
            layers: [
                tf.layers.dense({inputShape: [9], units: 9, activation: 'relu', name: 'input_layer'}),
                tf.layers.dense({units: 5}),
                tf.layers.dense({units: 1, activation: 'relu'}),
            ]
        });

        this.model.compile({
            optimizer: tf.train.adam(),
            loss: tf.metrics.MSE,
        });
    }

    public async load(): Promise<void> {
        this.model = await tf.loadLayersModel(this.path + '/model.json');
    }

    public async save(): Promise<void> {
        this.model.save(this.path);
    }

    public async predict(snapshot: Snapshot): Promise<tf.backend_util.TypedArray> {
        return (tf.tidy(() =>
                        this.model.predict(tf.tensor([[
                            snapshot.temperature,
                            snapshot.outside!.temperature,
                            snapshot.outside!.solarRadiation,
                            snapshot.outside!.humidity,
                            snapshot.outside!.windSpeed,
                            snapshot.outside!.windDirection,
                            snapshot.outside!.rainfall,
                            snapshot.heatingPercentage,
                            snapshot.coolingPercentage,
                        ]]))
                    ) as tf.Tensor<tf.Rank>).data();
    }

    public async train(snapshots: Snapshot[]): Promise<void> {
        await this.model.fitDataset(
            this.prepareDataset(snapshots),
            {
                epochs: 600,
                verbose: 1,
                callbacks: tf.node.tensorBoard(resolve(__dirname, '..', '..', 'tensorboard', 'linearRegression', 'logs')),
            }
        );
    }

    private prepareDataset(snapshots: Snapshot[]) {
        const dataset: {xs: tf.Tensor, ys: tf.Tensor}[] = [];
        for (let i = 0; i < snapshots.length - 1; i++) {
            const snapshot = snapshots[i];
            const nextSnapshot = snapshots[i+1];

            if (snapshot.outside) {
                dataset.push({
                    xs: tf.tensor([
                        snapshot.temperature,
                        snapshot.outside!.temperature,
                        snapshot.outside!.solarRadiation,
                        snapshot.outside!.humidity,
                        snapshot.outside!.windSpeed,
                        snapshot.outside!.windDirection,
                        snapshot.outside!.rainfall,
                        snapshot.heatingPercentage,
                        snapshot.coolingPercentage,
                    ]),
                    ys: tf.tensor([nextSnapshot.temperature])
                });
            }
        }

        if (dataset.length === 0) {
            throw new Error('Dataset is empty... Please make sure that KNMI data is included in the snapshot model');
        }

        return tf.data.array(dataset).repeat(3).shuffle(snapshots.length, undefined, true).batch(snapshots.length/2);
    }
}
