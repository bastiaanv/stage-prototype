using System;
using System.Collections.Generic;
using stage.cps;
using stage.data;
using stage.domain;
using stage.rl;

namespace stage.main {
    class Program {
        static void Main(string[] args) {
            List<Snapshot> snapshots = DataGenerator.GenerateLinearData(96);
            iCyberPhysicalSystem cps = CyberPhysicalSystem.MakeInstance(snapshots, 20, 18);

            ReinforcementLearning rl = new ReinforcementLearning();
            Console.WriteLine(rl.Run(cps));
        }
    }
}
