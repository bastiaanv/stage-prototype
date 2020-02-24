using System;
using System.Collections.Generic;
using stage.cps;
using stage.data;
using stage.domain;
using stage.rl.concept;

namespace stage.main {
    class Program {
        static void Main(string[] args) {
            // List<Snapshot> snapshots = DataGenerator.GenerateLinearData(96);
            // CyberPhysicalSystem cps = CyberPhysicalSystem.MakeInstance(snapshots, 20, 18);

            LinearRegression lr = new LinearRegression();
            Console.WriteLine(lr.Run());
        }
    }
}
