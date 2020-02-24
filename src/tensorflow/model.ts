import * as tf from '@tensorflow/tfjs-node'

export class Model {

    private readonly model: tf.Sequential;

    constructor(countInput: number, countHidden: number, countOutput: number) {
        this.model = tf.sequential({
            layers: [
                tf.layers.dense({inputShape: [countInput], units: countHidden, activation: 'relu'}),
                tf.layers.dense({units: countOutput, activation: 'softmax'}),
            ]
        });

        this.model.compile({
            optimizer: 'sgd',
            loss: 'meanSquaredError',
            metrics: ['accuracy']
        });
    }
}