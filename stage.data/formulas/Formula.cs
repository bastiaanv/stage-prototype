namespace stage.data.formulas {
    public interface Formula {
        double next();

        bool isActivelyHeating();
        bool isActivelyCooling();
    }
}