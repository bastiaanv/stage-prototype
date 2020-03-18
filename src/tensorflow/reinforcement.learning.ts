import { CyberPhysicalSystem } from '../cps/cyber.physical.system.interface';
import { FacilicomWallet } from '../rewards/facilicom.wallet';
import { Tensor, variable, randomNormal, Variable, tensor, backend_util, train, Scalar, tidy, losses } from '@tensorflow/tfjs-node';
import { FacilicomCoin } from '../rewards/facilicom.coin';
import { writeFile, readFileSync } from 'fs';

export class ReinforcementLearning {

    private readonly accuracies: number[] = [];

    // Normalization options
    private readonly minTemp = -20;
    private readonly maxTemp = 40;

    // Hyper parameters
    private readonly discount = 0.6;
    private readonly learningRate = 0.1;
    private readonly numEpochs = 20000;

    // Neural network matrixes
    private readonly weights1: Variable;
    private readonly bias1: Variable;
    private readonly weights2: Variable;
    private readonly bias2: Variable;
    private readonly weights3: Variable;
    private readonly bias3: Variable;

    private readonly optimizer = train.sgd(this.learningRate);

    // The neural network
    private model(x: Tensor): Tensor {
        return x
                // Hidden layer 1
                // .matMul(this.weights1)
                // .add(this.bias1)
                // .softmax()

                // Hidden layer 2
                // .matMul(this.weights2)
                // .add(this.bias2)
                // .softmax()

                // Output
                .matMul(this.weights3)
                .add(this.bias3);
    }

    // Use the model to get the index of the predicted action based on the given state
    private predict(x: Tensor): Tensor {
        return this.model(x).argMax();
    }

    // Train the model using the new Q values and current state
    private trainModel(targetQ: Tensor, input: Tensor): Scalar {
        return this.optimizer.minimize(() => {
            // losses.meanSquaredError(targetQ, this.model(input)).print();
            return losses.meanSquaredError(targetQ, this.model(input))
        }) as Scalar;
    }

/*
Neural network model:
        Input                   Hidden layer 1                  Hidden layer 2                      Output
    (countInput neurons) ->   (countHiddenLayer1 neurons)  ->  (countHiddenLayer2 neurons)   ->  (countOutput neuron)

This model is trained via a reinforcement learning algorithm and uses the softmax activation function.
The lose function is the mean squared error method with the Gradient descent optimizer as our learning partner.
*/

    constructor(countInput: number, countHiddenLayer1: number, countHiddenLayer2: number, countOutput: number, loadFile: boolean = false) {
        if (!loadFile) {
            this.weights1 = variable(randomNormal([countInput, countHiddenLayer1]));
            this.bias1 = variable(randomNormal([countHiddenLayer1]));
            this.weights2 = variable(randomNormal([countHiddenLayer1, countHiddenLayer2]));
            this.bias2 = variable(randomNormal([countHiddenLayer2]));
            this.weights3 = variable(randomNormal([countInput, countOutput]));
            this.bias3 = variable(randomNormal([countOutput]));

        } else {
            const modelJson: SavedModel = JSON.parse(readFileSync('model.json').toString());

            this.weights1 = variable(tensor(modelJson.weights1));
            this.bias1 = variable(tensor(modelJson.bias1));
            this.weights2 = variable(tensor(modelJson.weights2));
            this.bias2 = variable(tensor(modelJson.bias2));
            this.weights3 = variable(tensor(modelJson.weights3));
            this.bias3 = variable(tensor(modelJson.bias3));
        }
    }

    public async train(cpsCopy: CyberPhysicalSystem) {
        // Chance on random action
        let e = 0.1;

        for (let epoch = 0; epoch < this.numEpochs; epoch++) {
            const wallet = new FacilicomWallet();
            const cps: CyberPhysicalSystem = Object.assign( Object.create( Object.getPrototypeOf(cpsCopy)), cpsCopy);

            for (let batchNr = 0; batchNr < cps.datasetSize; batchNr++) {
                // Get q values from Neural Network
                const currentTemp: number = this.normalize(cps.getCurrentTemp());
                const qsa = tidy(() => this.model(tensor([[currentTemp]])));
                const predictTensor = tidy(() => this.predict(tensor([[currentTemp]])));

                const modelOutcome = await Promise.all([
                    qsa.data(),
                    predictTensor.data(),
                ]);
                const currentQ = modelOutcome[0];
                const actions = modelOutcome[1];

                // If true, then perform random action
                // if (Math.random() < e) {
                //     actions[0] = Math.round(Math.random() * currentQ.length);
                // }

                // Take action
                cps.step(this.actionToActionArray(actions[0], currentQ.length));

                // Get and save reward (Facilicom coins) to Facilicom wallet
                const coins: FacilicomCoin[] = cps.getReward();
                wallet.add(coins);

                // Get the new q values with the new state
                const newQTensor = tidy(() => this.model(tensor([[currentTemp]])));
                const newQ = await newQTensor.data();

                const maxNewQ = Math.max(...this.float32ArrayToArray(newQ));
                currentQ[actions[0]] = wallet.getLastValue() + this.discount * maxNewQ;

                // console.log(await qsa.data())
                // console.log(currentQ);

                // Train the model based on new Q values and current state
                tidy(() => this.trainModel(tensor([currentQ]), tensor([[currentTemp]])));

                // Cleanup tensors to prevent memory leak
                qsa.dispose();
                predictTensor.dispose();
                newQTensor.dispose();
            }

            // Decrease chance on a random action as we progress in learning
            e = 1/( ( epoch/50 ) + 10 );
            // console.log(`Facilicom coins gained during epoch ${epoch}: ${wallet.getTotalValue()}`);
            // console.log(`Accuracy during epoch ${epoch}: ${(wallet.getTotalValue()/cps.datasetSize *100).toFixed(1)}`);
            this.accuracies.push(wallet.getTotalValue() / cps.datasetSize * 100);
            console.log(`Average accuracy after ${epoch} epochs: ${(this.accuracies.reduce((a, b) => a+ b)/this.accuracies.length).toFixed(1)}`);
        }
    }

    public async saveToFile(): Promise<void> {
        const data = await Promise.all([
            this.weights1.data(),
            this.bias1.data(),
            this.weights2.data(),
            this.bias2.data(),
            this.weights3.data(),
            this.bias3.data(),
        ]);

        const file: SavedModel = {
            weights1: this.float32ArrayToArray(data[0]),
            bias1: this.float32ArrayToArray(data[1]),
            weights2: this.float32ArrayToArray(data[2]),
            bias2: this.float32ArrayToArray(data[3]),
            weights3: this.float32ArrayToArray(data[4]),
            bias3: this.float32ArrayToArray(data[5]),
        };

        writeFile('model.json', JSON.stringify(file), (err?: any) => {
            if (err) {
                console.log(err);
            }
        });
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
