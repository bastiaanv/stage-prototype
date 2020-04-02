import { ReinforcementLearning } from './tensorflow/reinforcement.learning';
import { Learning } from './tensorflow/learning.interface';
import * as dotenv from 'dotenv';
import { DataImporter } from './data/data.importer';

dotenv.config();

const dataImporter = new DataImporter();
const nn: Learning = new ReinforcementLearning();

// First we make connection to the db
dataImporter.connect().then(async () => {
    // Then we get the snapshots from the database
    const snapshots = await dataImporter.getSnapshots();

    // After that, we will train the NN
    nn.train(snapshots).then(async () => {
        // Lets check the accuracy of the NN
        const date = new Date();
        date.setHours(10,0,0,0);

        const values = await Promise.all([
            nn.predict(15, date),
            nn.predict(19, date),
            nn.predict(23, date),
        ]);
        console.log(values);
        console.log('Should be:');
        console.log(createShouldArray());

        await nn.save();
    });
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