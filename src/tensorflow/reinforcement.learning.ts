import { CyberPhysicalSystem } from '../cps/cyber.physical.system.interface';
import { FacilicomWallet } from '../rewards/facilicom.wallet';
import { Tensor, tensor, backend_util, train, tidy, sequential, layers, History, loadLayersModel, LayersModel } from '@tensorflow/tfjs-node';
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
    private readonly learningRate = 0.01;
    private readonly numEpochs = 20000;

    // Neural network
    private model: LayersModel;

/*
Neural network model:
        Input                   Hidden layer 1                  Hidden layer 2                      Output
    (countInput neurons) ->   (countHiddenLayer1 neurons)  ->  (countHiddenLayer2 neurons)   ->  (countOutput neuron)

This model is trained via a reinforcement learning algorithm and uses the softmax activation function.
The lose function is the mean squared error method with the Adam optimizer as our learning partner.
*/

    constructor(countInput: number, countHiddenLayer1: number, countHiddenLayer2: number, countOutput: number) {
        this.model = sequential({
            layers: [
            layers.dense({inputShape: [countInput], units: countHiddenLayer1, activation: 'relu'}),
            layers.dense({inputShape: [countHiddenLayer1], units: countHiddenLayer2, activation: 'relu'}),
            layers.dense({units: countOutput, activation: 'softmax'}),
            ]
        });

        this.model.compile({
            optimizer: train.sgd(this.learningRate),
            loss: 'meanSquaredError'
        });
    }

    public async loadModelFromFile() {
        this.model = await loadLayersModel(this.pathToModel)
        this.model.compile({
            optimizer: train.sgd(this.learningRate),
            loss: 'meanSquaredError'
        });
    }

    public async train(cpsCopy: CyberPhysicalSystem) {
        let epsilon = 0.1;
        const histories: History[] = [];

        for (let epoch = 0; epoch < this.numEpochs; epoch++) {
            const wallet = new FacilicomWallet();
            const cps: CyberPhysicalSystem = Object.assign( Object.create( Object.getPrototypeOf(cpsCopy)), cpsCopy);

            for (let batchNr = 0; batchNr < 100; batchNr++) {
                // The first step is to take a step into time using our CPS (Cyber Physical System). This way, we can train on fresh data/values/states
                // Get q values from Neural Network
                const currentTemp: number = this.normalize(cps.getCurrentTemp());
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
                const nextTemp: Tensor = tensor([[this.normalize(cps.getCurrentTemp())]]);
                const newQTensor = tidy(() => this.model.predict(nextTemp)) as Tensor;
                const newQ = await newQTensor.data();

                const maxNewQ = Math.max(...this.float32ArrayToArray(newQ));
                newQ[actions[0]] = wallet.getLastValue() + this.discount * maxNewQ;

                // Train model
                const target = tensor([newQ]);
                histories.push(await this.model.fit(nextTemp, target, {verbose: 0}));

                // Cleanup tensors to prevent memory leak
                nextTemp.dispose();
                qsa.dispose();
                action.dispose();
                target.dispose();
            }

            epsilon = 1/( ( epoch/50 ) + 10 );
            this.accuracies.push((wallet.getTotalValue() + 96) / (cps.datasetSize + 96) * 100);

            console.log(`Epoch ${epoch}; Average loss: ${(histories.reduce((a,b) => a + (b.history.loss[0] as number), 0)/histories.length).toFixed(4)}, last loss: ${(histories[histories.length - 1].history.loss[0] as number).toFixed(4)}, average accuracy: ${(this.accuracies.reduce((a, b) => a+ b)/this.accuracies.length).toFixed(1)}%, last accuracy: ${this.accuracies[this.accuracies.length-1].toFixed(1)}%`);
        }
    }

    public async saveToFile(): Promise<void> {
        await this.model.save(this.pathToModel);
    }

    private normalize(temp: number): number {
        return (temp - this.minTemp) / (this.maxTemp - this.minTemp);
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
}

interface SavedModel {
    weights1: number[];
    bias1: number[];
    weights2: number[];
    bias2: number[];
    weights3: number[];
    bias3: number[];
}
