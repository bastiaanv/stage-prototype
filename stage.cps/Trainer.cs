using System.Collections.Generic;
using System.Linq;
using stage.domain;

namespace stage.cps {
    public static class Trainer {
        public static double CalculatePassiveCooling(List<Snapshot> snapshots) {
            List<double> deltaValues = new List<double>();
            for(int i = 0; i < snapshots.Count; i++) {

                Snapshot snapshot = snapshots[i];
                if (snapshot.HeatingPercentage == 0 && snapshot.CoolingPercentage == 0) {
                    double deltaValue = snapshots[i+1].Value - snapshot.Value;
                    deltaValues.Add(deltaValue);
                }
            }

            return deltaValues.Count == 0 ? 0 : (deltaValues.Sum() / deltaValues.Count);
        }

        public static double CalculateActiveHeating(List<Snapshot> snapshots) {
            List<double> deltaValues = new List<double>();
            for(int i = 0; i < snapshots.Count; i++) {

                Snapshot snapshot = snapshots[i];
                if (snapshot.HeatingPercentage > 0 && snapshot.CoolingPercentage == 0) {
                    double deltaValue = snapshots[i+1].Value - snapshot.Value;
                    deltaValues.Add(deltaValue);
                }
            }

            return deltaValues.Count == 0 ? 0 : (deltaValues.Sum() / deltaValues.Count);
        }

        public static double CalculateActiveCooling(List<Snapshot> snapshots) {
            List<double> deltaValues = new List<double>();
            for(int i = 0; i < snapshots.Count; i++) {

                Snapshot snapshot = snapshots[i];
                if (snapshot.HeatingPercentage == 0 && snapshot.CoolingPercentage > 0) {
                    double deltaValue = snapshots[i+1].Value - snapshot.Value;
                    deltaValues.Add(deltaValue);
                }
            }

            return deltaValues.Count == 0 ? 0 : (deltaValues.Sum() / deltaValues.Count);
        }
    }
}