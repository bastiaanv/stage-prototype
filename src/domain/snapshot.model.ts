export interface Snapshot {
    when: Date;
    temperature: number;

    /**
     * Datasource is KNMI with in between a Facilicom REST wrapper
     */
    outside?: Outside;

    // Actions
    heatingPercentage: number;
    coolingPercentage: number;
}

/**
 * Datasource is KNMI with in between a Facilicom REST wrapper
 */
export interface Outside {
    /**
     * Outside temperature in degrees celsius. Meternumber: 344-0000000000069
     */
    temperature: number;

    /**
     * Solar radiation in J/cm2. Meternumber: 344-0000000000070
     */
    solarRadiation: number;

    /**
     * Relative humidity outside in % at 1.5 meter high. Meternumber: 344-0000000000072
     */
    humidity: number;

    /**
     * Average windspeed in m/s at that hour. Resolutions is 0.1 m/s. Meternumber: 344-0000000000073
     */
    windSpeed: number;

    /**
     * Wind direction in degrees celsius. Meternumber: 344-0000000000074
     */
    windDirection: number;

    /**
     * Hourly rainfall in mm. Resolutions is 0.1 mm. Meternumber: 344-0000000000076
     */
    rainfall: number;
}