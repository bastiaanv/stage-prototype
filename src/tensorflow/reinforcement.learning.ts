import * as tf from '@tensorflow/tfjs-node-gpu';
import { Learning } from './learning.interface';
import { CyberPhysicalSystem } from '../cps/cyber.physical.system';
import { Snapshot } from '../domain/snapshot.model';
import { resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';

export class ReinforcementLearning implements Learning {
    private readonly pathToModel = 'file://model/reinforced';
    private readonly pathAbsolute = resolve(__dirname, '..', '..', 'model', 'reinforced');
    private readonly nrOfInputs: number = CyberPhysicalSystem.nrOfDataPoints;
    // TODO: output uitbreiden voor 20% interval verwarmen.
    // IDEE: Discreet bepalen of er verwarmt moet worden daarna met regression bepalen hoe hard er verwarmt moet worden 
    private readonly nrOfActions: number = 3;
    private readonly timeSeries: number = 8;

    private model: tf.LayersModel;

    constructor() {
        const input = tf.input({shape: [this.timeSeries, this.nrOfInputs], name: 'Input'});
        const lstm1 = tf.layers.lstm({units: 8, activation: 'relu',}).apply(input);
        const output = tf.layers.dense({units: this.nrOfActions, name: 'output'}).apply(lstm1) as tf.SymbolicTensor;
        this.model = tf.model({inputs: input, outputs: output});

        this.model.compile({
            optimizer: tf.train.adam(),
            loss: this.bellmanEquationLossFunction,
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

    public async train(snapshots: Snapshot[]): Promise<void> {
        const cpsOriginal: CyberPhysicalSystem = await CyberPhysicalSystem.make(snapshots, false);
        let epsilon = 0.1;
        const discountFactor = 0.99;

        for (let i = 0; i < 600; i++) {
            // Make deep copy of CPS. This way we do not have to reinitialize the class each iteration, using the trainers, models and optimizers
            const cps: CyberPhysicalSystem = Object.assign( Object.create( Object.getPrototypeOf(cpsOriginal) ), cpsOriginal );
            await cps.start(this.timeSeries);

            // Let it loop through one day. 96 * 15 min = 24 hour
            for (let j = 0; j < 20; j++) {
                // Get data from the Cyber-Physical System
                const inputTensor = tf.tensor([[...cps.getDataFromMemory(this.timeSeries-1), cps.getCurrentData()]]);

                // Get the action from the NN following the Deep Q Network (DQN) principle
                const qValueTensor = tf.tidy(() => this.model.predict(inputTensor) as tf.Tensor);
                const actionTensor = tf.tidy(() => qValueTensor.argMax(1));
                const [actions, qValues] = await Promise.all([
                    actionTensor.data(),
                    qValueTensor.data(),
                ]);

                // If true, then perform random action instead of action that would be taken by the Neural Network
                // And do the action
                if (Math.random() < epsilon) {
                    actions[0] = Math.round(Math.random() * this.nrOfActions);
                }
                await cps.step(actions[0]);

                const inputNextTensor = tf.tensor([[...cps.getDataFromMemory(this.timeSeries-1), cps.getCurrentData()]]);

                // Get the next action from the NN
                const qValueNextTensor = tf.tidy(() => this.model.predict(inputNextTensor) as tf.Tensor).max(1);
                const [qValuesNext] = await Promise.all([
                    qValueNextTensor.data(),
                ]);

                // Calculate correct value for the Bellman Equation: R + y * Q(s', a')
                qValues[actions[0]] = cps.getReward() + discountFactor * qValuesNext[0];

                // Train NN
                const qValueOptimalTensor = tf.tensor([qValues]);
                await this.model.fit(inputTensor, qValueOptimalTensor, { epochs: 5, verbose: 1 });

                // Dispose remaining tensors
                inputTensor.dispose();
                inputNextTensor.dispose();
                qValueOptimalTensor.dispose();
                qValueTensor.dispose();
                qValueNextTensor.dispose();
                actionTensor.dispose();
            }

            // Degrease chance on random action
            epsilon = 1/( ( i/50 ) + 10 );
        }
    }

    /**
     * The loss function following the bellman expectation equation. cost = (Q(s, a) - (R + y * Q(s', a')))^2.
     * The loss function is a more detailed MSE function
     * @param yTrue The correct value following the formula: R + y * Q(s', a')
     * @param yPred The predicted value following the formula: Q(s, a)
     */
    private bellmanEquationLossFunction = tf.losses.meanSquaredError;
}
