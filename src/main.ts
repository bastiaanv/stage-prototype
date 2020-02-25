import { DataGenerator } from './data/data.generator';
import { RoomTemperatureApproach } from './cps/room.temperature.approach';
import { ReinforcementLearning } from './tensorflow/reinforcement.learning';
import { CyberPhysicalSystem } from './cps/cyber.physical.system.interface';

const snapshots = DataGenerator.generateLinearData(96);
const cps: CyberPhysicalSystem = RoomTemperatureApproach.make(snapshots, 20, 18);

const rl = new ReinforcementLearning(1, 150, 1);
rl.train(cps);