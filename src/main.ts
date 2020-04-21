import { ReinforcementLearning } from './tensorflow/reinforcement.learning';
import { Learning } from './tensorflow/learning.interface';
import * as dotenv from 'dotenv';
import { DataImporter } from './data/data.importer';
import { SupervisedLearning } from './tensorflow/supervised.learning';
import { Normalization } from './math/normalization.math';

const start = new Date();

dotenv.config();
const dataImporter = new DataImporter();
const nn: Learning = new ReinforcementLearning();

// First we make connection to the db
dataImporter.connect().then(async () => {
    // Then we get the snapshots from the database and disconnect from the database
    const snapshots = await dataImporter.getSnapshots();
    await dataImporter.disconnect();

    // After that, we will train the NN
    nn.load().then(async () => {
        await nn.save();

        // Lets check the accuracy of the NN
        const date = new Date();
        date.setHours(9,0,0,0);
        console.log(await nn.predict([
            [Normalization.temperature(16), Normalization.time(date)],
            [Normalization.temperature(16), Normalization.time(date)],
            [Normalization.temperature(16), Normalization.time(date)],
            [Normalization.temperature(16), Normalization.time(date)],
            [Normalization.temperature(16), Normalization.time(date)],
            [Normalization.temperature(16), Normalization.time(date)],
            [Normalization.temperature(16), Normalization.time(date)],
            [Normalization.temperature(16), Normalization.time(date)]
        ]));

        console.log(await nn.predict([
            [Normalization.temperature(19), Normalization.time(date)],
            [Normalization.temperature(19), Normalization.time(date)],
            [Normalization.temperature(19), Normalization.time(date)],
            [Normalization.temperature(19), Normalization.time(date)],
            [Normalization.temperature(19), Normalization.time(date)],
            [Normalization.temperature(19), Normalization.time(date)],
            [Normalization.temperature(19), Normalization.time(date)],
            [Normalization.temperature(19), Normalization.time(date)],
        ]));
        console.log(await nn.predict([
            [Normalization.temperature(25), Normalization.time(date)],
            [Normalization.temperature(25), Normalization.time(date)],
            [Normalization.temperature(25), Normalization.time(date)],
            [Normalization.temperature(25), Normalization.time(date)],
            [Normalization.temperature(25), Normalization.time(date)],
            [Normalization.temperature(25), Normalization.time(date)],
            [Normalization.temperature(25), Normalization.time(date)],
            [Normalization.temperature(25), Normalization.time(date)],
        ]));

        console.log(`Time took: ${Math.abs((new Date().getTime() - start.getTime()) / 1000)}sec, started: ${start.toISOString()}, time ended: ${new Date().toISOString()}`)
    });

}).catch(async () => {
    await dataImporter.disconnect();
});
