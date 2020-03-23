import { ReinforcementLearning } from './tensorflow/reinforcement.learning';
import { createObjectCsvWriter } from 'csv-writer';

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
});