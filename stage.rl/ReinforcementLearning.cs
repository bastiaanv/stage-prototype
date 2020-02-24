using static Tensorflow.Binding;
using Tensorflow;
using NumSharp;
using System;
using stage.domain;

namespace stage.rl {
    public class ReinforcementLearning {
        private Tensor input = null;
        private Tensor output = null;
        private Tensor predict = null;
        private Tensor loss = null;
        private Tensor trainer = null;
        private Random rand = new Random();

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
        public bool Run(iCyberPhysicalSystem cps) {
            BuildModel(1, 1, 150);
            Train(cps);

            return true;
        }

        private Graph BuildModel(int countInputs, int countOutputs, int countHidden) {
            var g = tf.get_default_graph();

            tf_with(tf.variable_scope("neural_network_model"), delegate {
                input = tf.placeholder(tf.float32, new TensorShape(-1, countInputs));

                var w = tf.get_variable("w", shape: (countInputs, countHidden), initializer: tf.random_normal_initializer(stddev: 0.1f));
                var b = tf.get_variable("b", shape: countHidden, initializer: tf.constant_initializer(0.1));
                Tensor z = tf.add(tf.matmul(input, w), b);
                var y = tf.nn.relu(z);

                var w2 = tf.get_variable("w2", shape: (countHidden, countOutputs), initializer: tf.random_normal_initializer(stddev: 0.1f));
                var b2 = tf.get_variable("b2", shape: countOutputs, initializer: tf.constant_initializer(0.1));
                output = tf.add(tf.matmul(y, w2), b2);

                predict = tf.argmax(z, 1);
            });

            tf_with(tf.variable_scope("training"), delegate {
                var nextQ = tf.placeholder(shape: (1,countOutputs), dtype: tf.float32);
                loss = tf.reduce_sum(tf.square(nextQ - output));
                trainer = tf.train.GradientDescentOptimizer(learning_rate: 0.1f).minimize(loss);
            });

            return g;
        }

        private void Train(iCyberPhysicalSystem cps) {
            // Set learning parameters
            double y = .99;
            double e = 0.1;
            int num_episodes = 2000;
            int rAll = 0;

            using (var sess = tf.Session(config)) {
                // init variables
                sess.run(tf.global_variables_initializer());

                for(int i = 0; i < num_episodes; i++) {
                    var (a, allQ) = sess.run((predict,output), feed_dict: (input, new float[,] { {(float)cps.CurrentTemp} }));
                    print(a);
                    if(rand.NextDouble() < e) {
                        a[0] = new[] { rand.NextDouble(), 0f};
                    } else {
                        a[0] = new[] { (float)a[0][0], 0f};
                    }

                    

                    cps.Step(a[0][0], a[0][1]);

                    var Q1 = sess.run(output, feed_dict: (input, cps.CurrentTemp));
                    var maxQ1 = np.max(Q1);
                    var targetQ = allQ;
                    // targetQ[0,a[0]] = r + y*maxQ1;

                    // rAll += r;

                    // Decrease random actions throught the learning process
                    e = 1f/((i/50) + 10);
                }
            }

            trained = true;
        }
    }
}