import { ReinforcementLearning } from './tensorflow/reinforcement.learning';
import { Learning } from './tensorflow/learning.interface';
import * as dotenv from 'dotenv';
import { DataImporter } from './data/data.importer';
import { SupervisedLearning } from './tensorflow/supervised.learning';
import { Normalization } from './math/normalization.math';

dotenv.config();
const amountOfRandomTests = 10;

const dataImporter = new DataImporter();
const nn: Learning = new SupervisedLearning();

// First we make connection to the db
// dataImporter.connect().then(async () => {
    // Then we get the snapshots from the database and disconnect from the database
    // const snapshots = await dataImporter.getSnapshots();
    // await dataImporter.disconnect();

    // After that, we will train the NN
    nn.train([]).then(async () => {
        await nn.save();
        console.log(await nn.predict([[Normalization.temperature(16)]]));
        console.log(await nn.predict([[Normalization.temperature(19)]]));
        console.log(await nn.predict([[Normalization.temperature(25)]]));
    });

    // Lets check the accuracy of the NN
//     const randomTests = [];
//     const predectionsToMake = [];
//     for (let i = 0; i < amountOfRandomTests; i++) {
//         const item = snapshots[Math.floor(Math.random() * snapshots.length)];

//         randomTests.push(item);
//         predectionsToMake.push(nn.predict(item.temperature, item.when));
//     }

//     const values = await Promise.all(predectionsToMake);

//     for (let i = 0; i < amountOfRandomTests; i++) {
//         console.log(`For a temperature of ${randomTests[i].temperature} degrees at ${randomTests[i].when.toISOString()}, the machine learning model will do:\n ${values[i]}`)
//     }

//     await nn.save();
// }).catch(async () => {
//     await dataImporter.disconnect();
// });
