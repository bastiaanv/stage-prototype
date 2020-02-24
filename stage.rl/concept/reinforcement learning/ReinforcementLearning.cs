using static Tensorflow.Binding;
using Tensorflow;
using NumSharp;
using System;

namespace stage.rl.concept {
    public class ReinforcementLearning : ITensorFlow {
        private Tensor input = null;
        private Tensor predict = null;
        private Tensor loss = null;
        private Tensor trainer = null;

        private readonly ConfigProto config = new ConfigProto {
            IntraOpParallelismThreads = 1,
            InterOpParallelismThreads = 1,
            LogDevicePlacement = true
        };

        private bool trained = false;

/*      
Neural network model:
                Input                           Hidden layer 1         Output
            (1 neurons, temperature value) ->   (150 neurons)  ->  (1 neuron, values between 0 and 1)

This model is trained via a supervised algorithm and uses the relu activation function.
The lose function is a sigmoid cross entropy method with the AdamOptimizer as our learning partner.
The accuracy is the mean squared error.
*/

        public bool Run() {
            BuildModel(2, 1, 150);
            Train();

            return true;
        }

        public float Predict(float temperature) {
            if (!trained) {
                throw new System.Exception("Model has not been trained yet...");
            }

            using (var sess = tf.Session(config)) {
                NDArray data = new float[,]
                            {
                                {1, 0 },
                                {1, 1 },
                                {0, 0 },
                                {0, 1 }
                            };
                sess.run(tf.global_variables_initializer());
 
                return sess.run(predict, (input, data));
            }
        }

        private Graph BuildModel(int countInputs, int countOutputs, int countHidden) {
            var g = tf.get_default_graph();
            Tensor z = null;

            tf_with(tf.variable_scope("neural_network_model"), delegate {
                input = tf.placeholder(tf.float32, new TensorShape(4, 2));

                var w = tf.get_variable("w", shape: (countInputs, countHidden), initializer: tf.random_normal_initializer(stddev: 0.1f));
                var b = tf.get_variable("b", shape: countHidden, initializer: tf.constant_initializer(0.1));
                z = tf.add(tf.matmul(input, w), b);
                var y = tf.nn.relu(z);

                var w2 = tf.get_variable("w2", shape: (countHidden, countOutputs), initializer: tf.random_normal_initializer(stddev: 0.1f));
                var b2 = tf.get_variable("b2", shape: countOutputs, initializer: tf.constant_initializer(0.1));
                z = tf.add(tf.matmul(y, w2), b2);

                predict = tf.argmax(z, 1);
            });

            // tf_with(tf.variable_scope("training"), delegate {
            //     var nextQ = tf.placeholder(shape: (1,countOutputs), dtype: tf.float32);
            //     loss = tf.reduce_sum(tf.square(nextQ - z));
            //     trainer = tf.train.GradientDescentOptimizer(learning_rate: 0.1f).minimize(loss);
            // });

            return g;
        }

        private void Train() {
            // Set learning parameters
            double y = .99;
            double e = 0.1;
            int num_episodes = 2000;

            using (var sess = tf.Session(config)) {
                // init variables
                sess.run(tf.global_variables_initializer());

            }

            trained = true;
        }
    }
}