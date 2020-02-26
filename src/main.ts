import { DataGenerator } from './data/data.generator';
import { RoomTemperatureApproach } from './cps/room.temperature.approach';
import { ReinforcementLearning } from './tensorflow/reinforcement.learning';
import { CyberPhysicalSystem } from './cps/cyber.physical.system.interface';
import * as fs from 'fs';
import * as util from 'util';

fs.writeFileSync(__dirname + '/../debug.log', '');

console.log = (d: any) => {
    fs.appendFileSync(__dirname + '/../debug.log', util.format(d) + '\n')
    process.stdout.write(util.format(d) + '\n');
};

const snapshots = DataGenerator.generateLinearData(96);
const cps: CyberPhysicalSystem = RoomTemperatureApproach.make(snapshots, 20, 12, 40, 10);

const rl = new ReinforcementLearning(1, 150, 2);
rl.train(cps);