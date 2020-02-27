import { CyberPhysicalSystem } from '../cps/cyber.physical.system.interface';
import { FacilicomWallet } from '../rewards/facilicom.wallet';
import { Tensor, variable, randomNormal, Variable, tensor, backend_util, square, sub, sum, train, Scalar } from '@tensorflow/tfjs-node';
import { FacilicomCoin } from '../rewards/facilicom.coin';

export class ReinforcementLearning {

    private readonly weights1: Variable;
    private readonly bias1: Variable;
    private readonly weights2: Variable;
    private readonly bias2: Variable;
    private readonly weights3: Variable;
    private readonly bias3: Variable;

    // The neural network
    private model(x: Tensor): Tensor {
        return x.matMul(this.weights1).add(this.bias1).relu().matMul(this.weights2).add(this.bias2).relu().matMul(this.weights3).add(this.bias3);
    }

    // Use the model to get the index of the predicted action based on the given state
    private predict(x: Tensor): Tensor {
        return this.model(x).argMax();
    }

    // Train the model using the 
    private trainModel(newQ: Tensor, input: Tensor): void {
        const optimizer = train.sgd(0.5);
        optimizer.minimize(() => {
            const loss = sum(square(sub(newQ, this.model(input)))) as Scalar;
            loss.print();
            return loss;
        });
    }

/*
Neural network model:
        Input                   Hidden layer 1                  Hidden layer 2                      Output
    (countInput neurons) ->   (countHiddenLayer1 neurons)  ->  (countHiddenLayer2 neurons)   ->  (countOutput neuron)

This model is trained via a reinforcement learning algorithm and uses the relu activation function.
The lose function is the mean squared error method with the Gradient descent optimizer as our learning partner.
*/

    constructor(countInput: number, countHiddenLayer1: number, countHiddenLayer2: number, countOutput: number) {
        this.weights1 = variable(randomNormal([countInput, countHiddenLayer1]));
        this.bias1 = variable(randomNormal([countHiddenLayer1]));
        this.weights2 = variable(randomNormal([countHiddenLayer1, countHiddenLayer2]));
        this.bias2 = variable(randomNormal([countHiddenLayer2]));
        this.weights3 = variable(randomNormal([countHiddenLayer2, countOutput]));
        this.bias3 = variable(randomNormal([countOutput]));
    }

    public async train(cpsCopy: CyberPhysicalSystem) {
        // Discount
        const y = .99;

        // Chance on random action
        let e = 0.1;

        // Number of iterations
        const numEpisodes = 2000;

        for (let epoch = 0; epoch < numEpisodes; epoch++) {
            const wallet = new FacilicomWallet();
            const cps = Object.assign( Object.create( Object.getPrototypeOf(cpsCopy)), cpsCopy);

            for (let batchNr = 0; batchNr < cps.datasetSize; batchNr++) {
                // Get q values from Neural Network
                const state = tensor([[cps.getCurrentTemp()]]);
                const modelOutcome = await Promise.all([
                    this.model(state).data(),
                    this.predict(state).data()
                ]);
                const currentQ = modelOutcome[0];
                const actions = modelOutcome[1];

                // If true, then perform random action
                if (Math.random() < e) {
                    actions[0] = Math.round(Math.random() * currentQ.length);
                }

                // Take action
                cps.step(this.actionToActionArray(actions[0], currentQ.length));

                // Get and save reward (Facilicom coins) to Facilicom wallet
                const coins: FacilicomCoin[] = cps.getReward();
                wallet.add(coins);

                // Get the new q values with the new state
                const newInput = tensor([[cps.getCurrentTemp()]]);
                const newQ = await (this.model(newInput)).data();

                const maxNewQ = Math.max(...this.float32ArrayToArray(newQ));
                currentQ[actions[0]] = wallet.getLastValue() + y * maxNewQ;

                // Train the model based on new Q values and current state
                this.trainModel(tensor(currentQ), state);
            }

            // Decrease chance on a random action as we progress in learning
            e = 1/( ( epoch/50 ) + 10 );
            console.log(`Facilicom points gained during epoch ${epoch}: ${wallet.getTotalValue()}`);
        }
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
