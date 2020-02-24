// CREDITS TO SciSharp FOR THIS EXAMPLE. All Rights Reserved to them

using static Tensorflow.Binding;
using System.Diagnostics;
using Tensorflow;

namespace stage.rl.concept {
    public class NeuralNetwork : ITensorFlow {
        Tensor input = null;
        Tensor x_inputs_data = null;
        Tensor y_inputs_data = null;
        Tensor accuracy = null;
        Tensor y_true = null;
        Tensor loss_op = null;
        Operation train_op = null;

/*      
Neural network model:
                Input            Hidden layer 1         Output
            (1024 neurons) ->   (1024 neurons)  ->  (1 neuron, values between 0 and 1)

This model is trained via a supervised algorithm and uses the relu activation function.
The lose function is a sigmoid cross entropy method with the AdamOptimizer as our learning partner.
The accuracy is the mean squared error.
*/

        public bool Run() {
            PrepareData();

            BuildGraph();
            Train();

            return true;
        }

        private Graph BuildGraph() {
            var g = tf.get_default_graph();
            
            Tensor z = null;
            
            tf_with(tf.variable_scope("placeholder"), delegate {
                input = tf.placeholder(tf.float32, shape: (-1, 1024));
                y_true = tf.placeholder(tf.int32, shape: (-1, 1));
            });

            tf_with(tf.variable_scope("FullyConnected"), delegate {
                var w = tf.get_variable("w", shape: (1024, 1024), initializer: tf.random_normal_initializer(stddev: 0.1f));
                var b = tf.get_variable("b", shape: 1024, initializer: tf.constant_initializer(0.1));
                z = tf.matmul(input, w) + b;
                var y = tf.nn.relu(z);

                var w2 = tf.get_variable("w2", shape: (1024, 1), initializer: tf.random_normal_initializer(stddev: 0.1f));
                var b2 = tf.get_variable("b2", shape: 1, initializer: tf.constant_initializer(0.1));
                z = tf.matmul(y, w2) + b2;
            });

            tf_with(tf.variable_scope("Loss"), delegate {
                var losses = tf.nn.sigmoid_cross_entropy_with_logits(tf.cast(y_true, tf.float32), z);
                loss_op = tf.reduce_mean(losses);
            });

            tf_with(tf.variable_scope("Accuracy"), delegate {
                var y_pred = tf.cast(z > 0, tf.int32);
                accuracy = tf.reduce_mean(tf.cast(tf.equal(y_pred, y_true), tf.float32));
            });

            var adam = tf.train.AdamOptimizer(0.01f);
            train_op = adam.minimize(loss_op, name: "train_op");

            return g;
        }

        private void Train() {
            var sw = new Stopwatch();
            sw.Start();

            var config = new ConfigProto {
                IntraOpParallelismThreads = 1,
                InterOpParallelismThreads = 1,
                LogDevicePlacement = true
            };

            using (var sess = tf.Session(config)) {
                // init variables
                sess.run(tf.global_variables_initializer());

                // check the accuracy before training
                var (x_input, y_input) = sess.run((x_inputs_data, y_inputs_data));
                sess.run(accuracy, (input, x_input), (y_true, y_input));

                // training
                foreach (var i in range(10000)) {
                    // by sampling some input data (fetching)
                    (x_input, y_input) = sess.run((x_inputs_data, y_inputs_data));
                    var (_, loss) = sess.run((train_op, loss_op), (input, x_input), (y_true, y_input));

                    // We regularly check the loss
                    if (i % 500 == 0)
                        print($"iter:{i} - loss:{loss}");
                }

                // Finally, we check our final accuracy
                (x_input, y_input) = sess.run((x_inputs_data, y_inputs_data));
                print($"Accuracy: {sess.run(accuracy, (input, x_input), (y_true, y_input))}");
            }

            print($"Time taken: {sw.Elapsed.TotalSeconds}s");
        }

        private void PrepareData() {
            // batches of 128 samples, each containing 1024 data points
            x_inputs_data = tf.random_normal(new[] { 128, 1024 }, mean: 0, stddev: 1);
            // We will try to predict this law:
            // predict 1 if the sum of the elements is positive and 0 otherwise
            y_inputs_data = tf.cast(tf.reduce_sum(x_inputs_data, axis: 1, keepdims: true) > 0, tf.int32);
        }
    }
}