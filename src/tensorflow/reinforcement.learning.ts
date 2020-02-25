import * as tf from '@tensorflow/tfjs-node'
import { CyberPhysicalSystem } from '../cps/cyber.physical.system.interface';

export class ReinforcementLearning {

    private readonly model: tf.Sequential;

    constructor(countInput: number, countHidden: number, countOutput: number) {
        this.model = tf.sequential({
            layers: [
                tf.layers.dense({ inputShape: [countInput], units: countHidden, activation: 'relu' }),
                tf.layers.dense({ units: countOutput }),
            ]
        });

        this.model.compile({
            optimizer: 'sgd',
            loss: 'meanSquaredError',
            metrics: ['accuracy']
        });
    }

    public train(cps: CyberPhysicalSystem) {

    }

    public predict() {
        return null;
    }
}