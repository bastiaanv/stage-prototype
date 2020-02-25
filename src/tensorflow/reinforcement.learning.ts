import * as tf from '@tensorflow/tfjs-node'
import { CyberPhysicalSystem } from '../cps/cyber.physical.system.interface';
import { Rank, Tensor } from '@tensorflow/tfjs-node';

export class ReinforcementLearning {

    private readonly model: tf.Sequential;

/*
Neural network model:
                Input                   Hidden layer 1                  Output
            (countInput neurons) ->   (countHiddenLayer1 neurons)  ->  (countOutput neuron, values between 0 and 1)

This model is trained via a reinforcement learning algorithm and uses the relu activation function.
The lose function is a sigmoid cross entropy method with the AdamOptimizer as our learning partner.
The accuracy is the mean squared error.
*/
    constructor(countInput: number, countHiddenLayer1: number, countOutput: number) {
        this.model = tf.sequential();

        this.model.add(tf.layers.dense({
            inputShape: [countInput],
            units: countHiddenLayer1,
            kernelInitializer: tf.initializers.glorotUniform({seed: 0}),
            activation: 'relu',
            useBias: true,
            biasInitializer: 'zeros'
        }));

        this.model.add(tf.layers.dense({
            units: countOutput,
            kernelInitializer: tf.initializers.randomUniform({
                minval: 0.003, maxval: 0.003, seed: 0}),
            activation: 'tanh',
            useBias: true,
            biasInitializer: 'zeros'
        }));
    }

    public async train(cps: CyberPhysicalSystem) {
        const y = .99;
        let e = 0.1;
        const numEpisodes = 1;

        for (let episode = 0; episode < numEpisodes; episode++) {
            for (let batchNr = 0; batchNr < cps.datasetSize; batchNr++) {
                const input = tf.tensor([[cps.getCurrentTemp()]]);
                const actions = await (this.model.predict(input) as Tensor<Rank>).data();

                // if true, then perform random action
                if (Math.random() < e) {
                    actions[0] = Math.round(Math.random());
                    actions[1] = Math.round(Math.random());

                } else {
                    actions[0] = Math.round(actions[0]);
                    actions[1] = Math.round(actions[1]);
                }

                cps.step(actions[0], actions[1]);
            }

            e = 1/( ( episode/50 ) + 10 );
        }
    }
}
