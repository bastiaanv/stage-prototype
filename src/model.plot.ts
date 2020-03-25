import { ReinforcementLearning } from './tensorflow/reinforcement.learning';
import { createObjectCsvWriter } from 'csv-writer';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { backend_util } from '@tensorflow/tfjs-node-gpu';

// Load the reinforcement learning model
const rl = new ReinforcementLearning(1, 24, 24, 3);
rl.loadModelFromFile().then(async () => {
    // Setup CSV writer
    const writer = createObjectCsvWriter({
        path: 'plot.csv',
        header: [
            {id: 'temp', title: 'Temperatuur'},
            {id: 'nothing', title: 'Actie: Niks doen'},
            {id: 'heating', title: 'Actie: Verwarmen'},
            {id: 'cooling', title: 'Actie: Koelen'},
        ]
    });

    // Loop through temperatures from 15 degrees to 25 degrees
    const data: {temp: number, nothing: boolean, heating: boolean, cooling: boolean}[] = [];
    for (let temp = 15; temp < 25; temp += 0.5) {
        const action = await rl.predict(temp);

        data.push({
            temp,
            nothing: action[0] === 0,
            heating: action[0] === 1,
            cooling: action[0] === 2
        });
    }

    // Write CSV file
    await writer.writeRecords(data);
    console.log('Done writing CSV file!');

    const weights: backend_util.TypedArray[] = [];
    await rl.getWeights().forEach(async (layer) => {
        weights.push(await layer.read().data());
    });

    writeFileSync(resolve(__dirname, '..', 'model', 'weights.json'), JSON.stringify(weights));
    console.log('Done writing weights')
});