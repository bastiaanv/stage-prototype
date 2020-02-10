using System;

namespace stage.cps.model {
    public class Snapshot {
        public DateTime When { get; set; }
        public double Value { get; set; }
        public double HeatingPercentage { get; set; }
        public double CoolingPercentage { get; set; }
    }
}
