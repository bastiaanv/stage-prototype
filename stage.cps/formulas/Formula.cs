namespace stage.cps.formulas {
    public interface Formula {
        double next();

        bool isActivelyHeating();
        bool isActivelyCooling();
    }
}