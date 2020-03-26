import { DataGenerator } from './data/data.generator';
import { RoomTemperatureApproach } from './cps/room.temperature.approach';
import { ReinforcementLearning } from './tensorflow/reinforcement.learning';
import { CyberPhysicalSystem } from './cps/cyber.physical.system.interface';
import * as fs from 'fs';
import * as util from 'util';

// Reset log file
fs.writeFileSync(__dirname + '/../debug.log', '');

// remap console.log in order to write every console.log to a file and print to console
console.log = (d: any) => {
    fs.appendFileSync(__dirname + '/../debug.log', util.format(d) + '\n')
    process.stdout.write(util.format(d) + '\n');
};

// Generate data, following a linear form
const snapshots = DataGenerator.generateLinearData(96);

// Generate a Cyber Physical System for the Reinforcement learning to train in
const cps: CyberPhysicalSystem = RoomTemperatureApproach.make(snapshots, 20, 12, 40, 10);

// Create the reinforcement learning model and train it
const rl = new ReinforcementLearning(1, 10, 10, 3);
// rl.loadModelFromFile().then(() => {
rl.train(cps);
// });

// Save model when done training
rl.saveToFile();