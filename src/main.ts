import * as tf from '@tensorflow/tfjs-node-gpu';

class NN {
    private readonly model: tf.LayersModel;
    private readonly nrOfActions: number;

    constructor() {
        const input = tf.input({shape: [1]});
        const dense1 = tf.layers.dense({units: 10, activation: 'relu'}).apply(input);
        const dense2 = tf.layers.dense({units: 10, activation: 'relu'}).apply(dense1);
        const dense3 = tf.layers.dense({units: 3, activation: 'softmax', name: 'output'}).apply(dense2) as tf.SymbolicTensor;
        this.model = tf.model({inputs: input, outputs: dense3});

        this.nrOfActions = 3;

        this.model.compile({
            optimizer: tf.train.adam(),
            loss: tf.metrics.categoricalCrossentropy,
        });
    }

    public async train(): Promise<void> {
        let epsilon = 0.1;

        for (let i = 0; i < 6000; i++) {
            // Generates a random temperature between 15 and 25 degrees and normalizes it
            const temp = this.normalize(Math.random() * 10 + 15);
            const tempTensor = tf.tensor([temp]);

            // Get the action from the NN
            const actualTensor = tf.tidy(() => this.model.predict(tempTensor) as tf.Tensor);
            let action = (await tf.tidy(() => actualTensor.argMax(1)).data())[0];

            // If true, then perform random action instead of action that would be taken by the Neural Network
            if (Math.random() < epsilon) {
                action = Math.round(Math.random() * this.nrOfActions);
            }

            // Get reward for NN and update actual array
            const actual = await actualTensor.data();
            actual[action] = this.getReward(temp, action);

            // Train NN
            const label = tf.tensor([actual]);
            await this.model.fit(tempTensor, label, { epochs: 5, verbose: 1 });

            // Dispose remaining tensors
            tempTensor.dispose();
            label.dispose();

            // Degrease chance on random action
            epsilon = 1/( ( i/50 ) + 10 );
        }
    }

    public predict(temp: number) {
        return (this.model.predict(tf.tensor([this.normalize(temp)])) as tf.Tensor).data();
    }

    public printWeights() {
        for(const layer of this.model.weights) {
            layer.read().print();
        }
    }

    private getReward(temp: number, action: number): number {
        // Below 16 degrees, positive reward for turning on the heater
        if (temp < 16) {
            if (action === 1) {
                return 1
            
            } else {
                return 0;
            }
        
        // Above 20 degrees, positive reward for turning on the AC
        } else if (temp > 20) {
            if (action === 2) {
                return 1
            
            } else {
                return 0;
            }
        
        // Between 16 and 20 degrees, positive reward for doing noting
        } else {
            if (action === 0) {
                return 1
            
            } else {
                return 0;
            }
        }
    }

    private normalize(x: number): number {
        return (x + 20) / 60;
    }
}

// tf.metrics.categoricalAccuracy(tf.tensor([0, 1, 0]), tf.tensor([0, 1, 0])).print();
const nn = new NN();
nn.train().then(async () => {
    const values = await Promise.all([
        nn.predict(15),
        nn.predict(19),
        nn.predict(23),
    ])
    console.log(values);
    console.log('Should be:')
    console.log([[0,1,0], [1,0,0], [0,0,1]])
});