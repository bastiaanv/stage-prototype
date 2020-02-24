namespace stage.domain {
    public interface iCyberPhysicalSystem {
        double CurrentTemp { get; }
         void Step(double actionHeating, double actionCooling);
    }
}