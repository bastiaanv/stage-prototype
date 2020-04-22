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
    nn.train(snapshots).then(async () => {
        await nn.save();

        // Lets check the accuracy of the NN
        // Form data = [RoomTemperature, OutsideTemperature, Time, Date]
        const outsideTemperature = Normalization.temperature(19);
        const date = new Date(2020, 4, 22, 9, 0, 0,0);
        const dateNormalized = Normalization.date(date);
        const timeNormalized = Normalization.time(date);
        const roomTemperature16 = Normalization.temperature(16);
        const roomTemperature19 = Normalization.temperature(19);
        const roomTemperature25 = Normalization.temperature(25);

        console.log(await nn.predict([
            [roomTemperature16, outsideTemperature, timeNormalized, dateNormalized],
            [roomTemperature16, outsideTemperature, timeNormalized, dateNormalized],
            [roomTemperature16, outsideTemperature, timeNormalized, dateNormalized],
            [roomTemperature16, outsideTemperature, timeNormalized, dateNormalized],
            [roomTemperature16, outsideTemperature, timeNormalized, dateNormalized],
            [roomTemperature16, outsideTemperature, timeNormalized, dateNormalized],
            [roomTemperature16, outsideTemperature, timeNormalized, dateNormalized],
            [roomTemperature16, outsideTemperature, timeNormalized, dateNormalized],
        ]));

        console.log(await nn.predict([
            [roomTemperature19, outsideTemperature, timeNormalized, dateNormalized],
            [roomTemperature19, outsideTemperature, timeNormalized, dateNormalized],
            [roomTemperature19, outsideTemperature, timeNormalized, dateNormalized],
            [roomTemperature19, outsideTemperature, timeNormalized, dateNormalized],
            [roomTemperature19, outsideTemperature, timeNormalized, dateNormalized],
            [roomTemperature19, outsideTemperature, timeNormalized, dateNormalized],
            [roomTemperature19, outsideTemperature, timeNormalized, dateNormalized],
            [roomTemperature19, outsideTemperature, timeNormalized, dateNormalized],
        ]));
        console.log(await nn.predict([
            [roomTemperature25, outsideTemperature, timeNormalized, dateNormalized],
            [roomTemperature25, outsideTemperature, timeNormalized, dateNormalized],
            [roomTemperature25, outsideTemperature, timeNormalized, dateNormalized],
            [roomTemperature25, outsideTemperature, timeNormalized, dateNormalized],
            [roomTemperature25, outsideTemperature, timeNormalized, dateNormalized],
            [roomTemperature25, outsideTemperature, timeNormalized, dateNormalized],
            [roomTemperature25, outsideTemperature, timeNormalized, dateNormalized],
            [roomTemperature25, outsideTemperature, timeNormalized, dateNormalized],
        ]));

        console.log(`Time took: ${Math.abs((new Date().getTime() - start.getTime()) / 1000)}sec, started: ${start.toISOString()}, time ended: ${new Date().toISOString()}`)
    });

}).catch(async (err) => {
    console.log(err);
    await dataImporter.disconnect();
});
