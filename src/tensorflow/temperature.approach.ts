import * as tf from '@tensorflow/tfjs-node-gpu';
import { Snapshot } from '../domain/snapshot.model';
import { resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';

/**
 * Uses MLP to approach the new room temperature.
 */
export class TemperatureApproach {
    private readonly path = 'file://model/mlp';
    private readonly pathAbsolute = resolve(__dirname, '..', '..', 'model', 'mlp');
    private model: tf.LayersModel;

    constructor() {
        this.model = tf.sequential({
            layers: [
                tf.layers.dense({inputShape: [12], units: 12, activation: 'relu', name: 'input_layer'}),
                tf.layers.dense({units: 5}),
                tf.layers.dense({units: 1, activation: 'relu'}),
            ]
        });

        this.model.compile({
            optimizer: tf.train.adam(),
            metrics: [tf.metrics.meanAbsolutePercentageError, tf.metrics.meanAbsoluteError, tf.metrics.mse],
            loss: tf.metrics.meanAbsoluteError,
        });
    }

    public async load(): Promise<void> {
        this.model = await tf.loadLayersModel(this.path + '/model.json');
    }

    public async save(): Promise<void> {
        if (!existsSync(this.pathAbsolute)) {
            mkdirSync(this.pathAbsolute, { recursive: true });
        }

        await this.model.save(this.path);
    }

    public async predict(snapshot: Snapshot, preTemperature: number, prePreTemperature: number): Promise<tf.backend_util.TypedArray> {
        return (tf.tidy(() =>
                        this.model.predict(tf.tensor([[
                            snapshot.temperature,
                            preTemperature,
                            prePreTemperature,
                            snapshot.heatingPercentage,
                            snapshot.coolingPercentage,
                            snapshot.occupied ? 1 : 0,
                            snapshot.outside!.temperature,
                            snapshot.outside!.solarRadiation,
                            snapshot.outside!.humidity,
                            snapshot.outside!.windSpeed,
                            snapshot.outside!.windDirection,
                            snapshot.outside!.rainfall,
                        ]]))
                    ) as tf.Tensor<tf.Rank>).data();
    }

    public async train(snapshots: Snapshot[]): Promise<void> {
        await this.model.fitDataset(
            this.prepareDataset(snapshots),
            {
                epochs: 2000,
                verbose: 1,
                callbacks: tf.node.tensorBoard(resolve(__dirname, '..', '..', 'tensorboard', 'linearRegression', 'logs')),
            }
        );
    }

    private prepareDataset(snapshots: Snapshot[]) {
        const dataset: {xs: tf.Tensor, ys: tf.Tensor}[] = [];
        for (let i = 2; i < snapshots.length - 1; i++) {
            const prePreSnapshot = snapshots[i-2];
            const preSnapshot = snapshots[i-1];
            const snapshot = snapshots[i];
            const nextSnapshot = snapshots[i+1];

            if (snapshot.outside) {
                dataset.push({
                    xs: tf.tensor([
                        snapshot.temperature,
                        preSnapshot.temperature,
                        prePreSnapshot.temperature,
                        snapshot.heatingPercentage,
                        snapshot.coolingPercentage,
                        snapshot.occupied ? 1 : 0,
                        snapshot.outside!.temperature,
                        snapshot.outside!.solarRadiation,
                        snapshot.outside!.humidity,
                        snapshot.outside!.windSpeed,
                        snapshot.outside!.windDirection,
                        snapshot.outside!.rainfall,
                    ]),
                    ys: tf.tensor([nextSnapshot.temperature])
                });
            }
        }

        if (dataset.length === 0) {
            throw new Error('Dataset is empty... Please make sure that KNMI data is included in the snapshot model');
        }

        return tf.data.array(dataset).repeat(3).shuffle(dataset.length, undefined, true).batch(dataset.length/2);
    }
}
