import * as tf from '@tensorflow/tfjs-node-gpu';

class NN {
    private readonly model: tf.LayersModel;

    constructor() {
        const input = tf.input({shape: [1]});
        const dense1 = tf.layers.dense({units: 10, activation: 'relu'}).apply(input);
        const dense2 = tf.layers.dense({units: 10, activation: 'relu'}).apply(dense1);
        const dense3 = tf.layers.dense({units: 3, activation: 'softmax', name: 'output'}).apply(dense2) as tf.SymbolicTensor;
        this.model = tf.model({inputs: input, outputs: dense3});

        this.model.compile({
            optimizer: tf.train.adam(),
            metrics: [tf.metrics.categoricalAccuracy],
            loss: tf.metrics.categoricalCrossentropy,
        });
    }

    public train() { 
        return this.model.fitDataset(
            this.generateDataAndLabels(),
            { epochs: 600, verbose: 1 }
        );
    }

    public predict(temp: number) {
        return (this.model.predict(tf.tensor([this.normalize(temp)])) as tf.Tensor).data();
    }

    public printWeights() {
        for(const layer of this.model.weights) {
            layer.read().print();
        }
    }

    private generateDataAndLabels() {
        const dataset: {xs: tf.Tensor, ys: tf.Tensor}[] = [];
        for (let temperature = 12; temperature < 24; temperature += 0.1) {
            dataset.push({
                xs: tf.tensor([this.normalize(temperature)]),
                ys: tf.tensor([temperature > 16 && temperature < 20 ? 1 : 0, temperature < 16 ? 1 : 0, temperature > 20 ? 1 : 0])
            });
        }
        
        return tf.data.array(dataset).repeat(3).shuffle(120, undefined, true).batch(60);
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
});