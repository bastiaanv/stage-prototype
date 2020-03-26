import { CyberPhysicalSystem } from '../cps/cyber.physical.system.interface';
import { FacilicomWallet } from '../rewards/facilicom.wallet';
import { Tensor, tensor, train, tidy, sequential, layers, History, loadLayersModel, LayersModel, backend_util, losses } from '@tensorflow/tfjs-node-gpu';
import * as tf from '@tensorflow/tfjs-node-gpu';
import { FacilicomCoin } from '../rewards/facilicom.coin';
import { resolve } from 'path';

export class ReinforcementLearning {

    private readonly pathToModel = 'file://' + resolve(__dirname, '..', '..', 'model');
    private readonly accuracies: number[] = [];

    // Normalization options
    private readonly minTemp = -20;
    private readonly maxTemp = 40;

    // Hyper parameters
    private readonly discount = 0.6;
    private readonly learningRate = 0.1;
    private readonly numEpochs = 600;

    // Neural network
    private model: LayersModel;

/*
Neural network model:
        Input                   Hidden layer 1                  Hidden layer 2                      Output
    (countInput neurons) ->   (countHiddenLayer1 neurons)  ->  (countHiddenLayer2 neurons)   ->  (countOutput neuron)

This model is trained via a reinforcement learning algorithm and uses the relu and softmax activation function.
The lose function is the mean squared error method with the stochastic gradient descent optimizer as our learning partner.
*/

    constructor(countInput: number, countHiddenLayer1: number, countHiddenLayer2: number, countOutput: number) {
        const input = tf.input({shape: [countInput]});
        const dense1 = tf.layers.dense({units: countHiddenLayer1, activation: 'relu'}).apply(input);
        const dense2 = tf.layers.dense({units: countHiddenLayer2, activation: 'relu'}).apply(dense1);
        const dense3 = tf.layers.dense({units: countOutput, activation: 'softmax'}).apply(dense2) as tf.SymbolicTensor;
        this.model = tf.model({inputs: input, outputs: dense3});

        this.modelCompile();
    }

    public getWeights() {
        return this.model.weights;
    }

    public async loadModelFromFile() {
        this.model = await loadLayersModel(this.pathToModel + '/model.json')
        this.modelCompile();
    }

    public async saveToFile(): Promise<void> {
        await this.model.save(this.pathToModel);
    }

    public predict(temp: number): Promise<backend_util.TypedArray> {
        const currentTemp: number = this.normalize(temp, true);
        const qsa = tidy(() => this.model.predict(tensor([[currentTemp]]))) as Tensor;

        return qsa.argMax(1).data();
    }

    public async train(cpsCopy: CyberPhysicalSystem) {
        let epsilon = 0.1;
        const histories: History[] = [];

        for (let epoch = 0; epoch < this.numEpochs; epoch++) {
            const wallet = new FacilicomWallet();
            const cps: CyberPhysicalSystem = Object.assign( Object.create( Object.getPrototypeOf(cpsCopy)), cpsCopy);
            cps.start();

            for (let batchNr = 0; batchNr < 100; batchNr++) {
                // The first step is to take a step into time using our CPS (Cyber Physical System). This way, we can train on fresh data/values/states
                // Get q values from Neural Network
                const currentTemp: number = this.normalize(cps.getCurrentTemp(), true);
                const qsa = tidy(() => this.model.predict(tensor([[currentTemp]]))) as Tensor;
                const action = qsa.argMax(1);

                const [currentQ, actions] = await Promise.all([ qsa.data(), action.data() ]);

                // If true, then perform random action instead of action that would be taken by the Neural Network
                if (Math.random() < epsilon) {
                    actions[0] = Math.round(Math.random() * currentQ.length);
                }

                // Take action
                cps.step(this.actionToActionArray(actions[0], currentQ.length));

                // Now we can start training the Neural Network, since we have taken the next step in time
                // Get and save reward (Facilicom coins) to Facilicom wallet
                const coins: FacilicomCoin[] = cps.getReward();
                wallet.add(coins);

                // Get the new q values with the new state
                // const maxNewQ = Math.max(...this.float32ArrayToArray(newQ));
                currentQ[actions[0]] = this.normalize(wallet.getLastValue(), false);

                // Train model
                const target = tensor([currentQ]);
                const label = tensor([[currentTemp]]);
                histories.push(await this.model.fit(label, target, {verbose: 0}));

                // Cleanup tensors to prevent memory leak
                label.dispose();
                qsa.dispose();
                action.dispose();
                target.dispose();
            }

            epsilon = 1/( ( epoch/50 ) + 10 );
            this.accuracies.push((wallet.getTotalValue() + 100) / (cps.datasetSize + 100) * 100);

            console.log(`Epoch ${epoch}; Average loss: ${(histories.reduce((a,b) => a + (b.history.loss[0] as number), 0)/histories.length).toFixed(4)}, last loss: ${(histories[histories.length - 1].history.loss[0] as number).toFixed(4)}, average accuracy: ${(this.accuracies.reduce((a, b) => a+ b)/this.accuracies.length).toFixed(1)}%, last accuracy: ${this.accuracies[this.accuracies.length-1].toFixed(1)}%`);
        }
    }

    private normalize(x: number, isTemp: boolean): number {
        if (isTemp) {
            return (x - this.minTemp) / (this.maxTemp - this.minTemp);
        }

        return (x + 1) / 2;
    }

    // Transform a float32array to a basic js array
    private float32ArrayToArray(array: backend_util.TypedArray): number[] {
        const output: number[] = [];
        for (const item of array) {
            output.push(item);
        }

        return output;
    }

    // Creates an array which can be accepted by the CPS to preform actions
    private actionToActionArray(index: number, length: number): number[] {
        const output: number[] = [];
        for (let i = 0; i < length; i++) {
            if (i === index) {
                output.push(1);

            } else {
                output.push(0);
            }
        }

        return output;
    }

    private modelCompile(): void {
        this.model.compile({
            optimizer: tf.train.adam(),
            metrics: [tf.metrics.categoricalAccuracy],
            loss: tf.metrics.categoricalCrossentropy,
        });
    }
}
