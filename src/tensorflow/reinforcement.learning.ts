import * as tf from '@tensorflow/tfjs-node-gpu';
import { Learning } from './learning.interface';
import { CyberPhysicalSystem } from '../cps/cyber.physical.system';
import { Snapshot } from '../domain/snapshot.model';

export class ReinforcementLearning implements Learning {
    private readonly pathToModel = 'file://model';
    private readonly nrOfInputs: number = 4;
    // TODO: output uitbreiden voor 20% interval verwarmen.
    // IDEE: Discreet bepalen of er verwarmt moet worden daarna met regression bepalen hoe hard er verwarmt moet worden 
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
     * @param data Normalized data for the Recurrent Neural Network. First dimention is for time serries, second dimention contains the situational data, like temperature and date/time
     * @returns Promise<Float32Array>. When value is close to 1, the RNN is saying that that action has to be done. Position 0 -> Do nothing, Position 1 -> Go Heating, Position 2 -> Go Cooling.
     */
    public predict(data: number[][]) {
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

    /**
     * Trains the RNN using a self generated dataset
     * @param snapshots A Dataset to train on
     * @returns Promse<void>
     */
    public async train(snapshots: Snapshot[]): Promise<void> {
        const cpsOriginal: CyberPhysicalSystem = CyberPhysicalSystem.make(snapshots, 10, 40, 15);
        let epsilon = 0.1;

        for (let i = 0; i < 600; i++) {
            // Make deep copy of CPS. This way we do not have to reinitialize the class each iteration, using the trainers and optimizers
            const cps: CyberPhysicalSystem = Object.assign( Object.create( Object.getPrototypeOf(cpsOriginal) ), cpsOriginal );
            cps.start(this.timeSeries);

            // Let it loop through one day
            for (let j = 0; j < 96; j++) {
                // Get temperature and date form Cyber-Physical System
                const tempTensor = tf.tensor([[...cps.getDataFromMemory(this.timeSeries-1), cps.getCurrentData()]]);

                // Get the action from the NN
                const actualTensor = tf.tidy(() => this.model.predict(tempTensor) as tf.Tensor);
                const actionTensor = tf.tidy(() => actualTensor.argMax(1));
                const [actions, actual] = await Promise.all([
                    actionTensor.data(),
                    actualTensor.data(),
                ]);

                // If true, then perform random action instead of action that would be taken by the Neural Network
                if (Math.random() < epsilon) {
                    actions[0] = Math.round(Math.random() * this.nrOfActions);
                }

                // Do action and get reward for NN and update actual array
                cps.step(actions[0]);
                actual[actions[0]] = cps.getReward();

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
