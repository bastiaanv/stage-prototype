import { ReinforcementLearning } from './tensorflow/reinforcement.learning';
import { Learning } from './tensorflow/learning.interface';
import { DataGenerator } from './data/data.generator';

// Generate data, following a linear form
const snapshots = DataGenerator.generateLinearData(96);

// Learning
const nn: Learning = new ReinforcementLearning();
nn.train(snapshots).then(async () => {
    const values = await Promise.all([
        nn.predict(15),
        nn.predict(19),
        nn.predict(23),
    ])
    console.log(values);
    console.log('Should be:');
    console.log(createShouldArray());

    await nn.save();
});

function createShouldArray() {
    const shouldBe1 = new Float32Array(3);
    shouldBe1[0] = 0;
    shouldBe1[1] = 1;
    shouldBe1[2] = 0;

    const shouldBe2 = new Float32Array(3);
    shouldBe2[0] = 1;
    shouldBe2[1] = 0;
    shouldBe2[2] = 0;

    const shouldBe3 = new Float32Array(3);
    shouldBe3[0] = 0;
    shouldBe3[1] = 0;
    shouldBe3[2] = 1;

    return [shouldBe1, shouldBe2, shouldBe3];
}