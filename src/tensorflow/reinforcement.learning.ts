import * as tf from '@tensorflow/tfjs-node-gpu';
import { resolve } from 'path';
import { Learning } from './learning.interface';
import { TemperatureReward } from '../reward/temperature.reward';
import { Normalization } from '../math/normalization.math';
import { TemperatureApproach } from '../cps/temperature.approach';
import { Snapshot } from '../domain/snapshot.model';
import { CyberPhysicalSystem } from '../cps/cyber.physical.system.interface';

export class ReinforcementLearning implements Learning {
    private readonly pathToModel = 'file://' + resolve(__dirname, '..', '..', 'model');

    private readonly tempReward = new TemperatureReward();
    private readonly model: tf.LayersModel;
    private readonly nrOfActions: number = 3;

    constructor() {
        const input = tf.input({shape: [1]});
        const dense1 = tf.layers.dense({units: 10, activation: 'relu'}).apply(input);
        const dense2 = tf.layers.dense({units: 10, activation: 'relu'}).apply(dense1);
        const dense3 = tf.layers.dense({units: this.nrOfActions, activation: 'softmax'}).apply(dense2) as tf.SymbolicTensor;
        this.model = tf.model({inputs: input, outputs: dense3});

        this.model.compile({
            optimizer: tf.train.adam(),
            loss: tf.metrics.categoricalCrossentropy,
        });
    }

    public async save(): Promise<void> {
        await this.model.save(this.pathToModel);
    }

    public predict(temp: number) {
        return (this.model.predict(tf.tensor([Normalization.temperature(temp)])) as tf.Tensor).data();
    }

    public async train(snapshots: Snapshot[]): Promise<void> {
        const cpsOriginal: CyberPhysicalSystem = TemperatureApproach.make(snapshots, 10, 40, 15);
        let epsilon = 0.1;

        for (let i = 0; i < 12000; i++) {
            const cps: CyberPhysicalSystem = Object.assign( Object.create( Object.getPrototypeOf(cpsOriginal)), cpsOriginal);
            cps.randomizeStart();

            for (let j = 0; j < 100; j++) {
                // Generates a random temperature between 15 and 25 degrees and normalizes it
                const temp = Normalization.temperature(cps.getCurrentTemp());
                const tempTensor = tf.tensor([temp]);

                // Get the action from the NN
                const actualTensor = tf.tidy(() => this.model.predict(tempTensor) as tf.Tensor);
                const actionTensor = tf.tidy(() => actualTensor.argMax(1));
                let action = (await actionTensor.data())[0];

                // If true, then perform random action instead of action that would be taken by the Neural Network
                if (Math.random() < epsilon) {
                    action = Math.round(Math.random() * this.nrOfActions);
                }

                // Set step into time
                cps.step(action);

                // Get reward for NN and update actual array
                const actual = await actualTensor.data();
                actual[action] = cps.getReward();

                // Train NN
                const label = tf.tensor([actual]);
                await this.model.fit(tempTensor, label, { epochs: 5, verbose: 1 });

                // Dispose remaining tensors
                tempTensor.dispose();
                label.dispose();
                actualTensor.dispose();
                actionTensor.dispose();
            }

            // Degrease chance on random action
            epsilon = 1/( ( i/50 ) + 10 );
        }
    }
}
