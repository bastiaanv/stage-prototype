using System.Collections.Generic;
using stage.domain;

namespace stage.cps {
    public class CyberPhysicalSystem : iCyberPhysicalSystem {

        private readonly double _deltaPasiveCooling = 0;
        private readonly double _deltaActiveHeating = 0;
        private readonly double _deltaActiveCooling = 0;
        private readonly double _minTemp = 0;

        public double CurrentTemp { get; private set; } = 0;

        private CyberPhysicalSystem(double deltaPasiveCooling, double minTemp, double deltaActiveHeating, double deltaActiveCooling, double initTemp) {
            _deltaPasiveCooling = deltaPasiveCooling;
            _minTemp = minTemp;
            _deltaActiveHeating = deltaActiveHeating;
            _deltaActiveCooling = deltaActiveCooling;
            CurrentTemp = initTemp;
        }

        public static iCyberPhysicalSystem MakeInstance(List<Snapshot> snapshots, double initTemp, double minTemp) {
            double deltaPassiveCooling = Trainer.CalculatePassiveCooling(snapshots);
            double deltaActiveHeating = Trainer.CalculateActiveHeating(snapshots);
            double deltaActiveCooling = Trainer.CalculateActiveCooling(snapshots);

            return new CyberPhysicalSystem(deltaPassiveCooling, minTemp, deltaActiveHeating, deltaActiveCooling, initTemp);
        }

        public void Step(double actionHeating, double actionCooling) {
            CurrentTemp = -_deltaPasiveCooling * CurrentTemp + _minTemp + _deltaActiveHeating * actionHeating - _deltaActiveCooling * actionCooling;
        }
    }
}