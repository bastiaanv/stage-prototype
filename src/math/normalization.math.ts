// Formula: N = (x - min) / (max - min)

export class Normalization {
    // Max = 40
    // Min = -20
    public static temperature(temperature: number): number {
        return (temperature + 20) / 60;
    }

    // Max = {parameter}
    // Min = 0
    public static reward(reward: number, max: number): number {
        return reward / max;
    }

    // Hour normalization
    // Max = 24 * 60 = 1440
    // Min = 0
    public static time(date: Date): number {
        return (date.getHours() * 60 + date.getMinutes()) / 1440;
    }
}
