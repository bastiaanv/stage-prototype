using System;
using System.Collections.Generic;
using stage.cps;
using stage.cps.model;

namespace stage.main {
    class Program {
        static void Main(string[] args) {
            List<Snapshot> snapshots = DataGenerator.GenerateLinearData(96);

            foreach(Snapshot snapshot in snapshots) {
                Console.WriteLine(snapshot.When.ToShortTimeString() + " with " + snapshot.Value);
            }
        }
    }
}
