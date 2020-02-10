namespace stage.data.formulas {
    public class Chainsaw : Formula {
        private readonly double _deltaPassiveCooling;
        private readonly double _deltaActiveHeating;
        private readonly double _maxValue;
        private readonly double _minValue;

        private bool needHeating = false;
        private double previousValue = 0;

        public Chainsaw(double deltaPassiveCooling, double deltaActiveHeating, double maxValue, double minValue, double initValue) {
            _deltaPassiveCooling = deltaPassiveCooling;
            _deltaActiveHeating = deltaActiveHeating;
            _maxValue = maxValue;
            _minValue = minValue;

            previousValue = initValue;
        }

        public double next() {
            if (previousValue > _maxValue) {
                needHeating = false;
            } else if (previousValue < _minValue) {
                needHeating = true;
            }

            double output = 0;
            if (!needHeating) {
                output = previousValue - _deltaPassiveCooling;
            
            } else {
                output = previousValue + _deltaActiveHeating;
            }

            previousValue = output;
            return output;
        }
        
        public bool isActivelyHeating() => needHeating;
        public bool isActivelyCooling() => false;
    }
}