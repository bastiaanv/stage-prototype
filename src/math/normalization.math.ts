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
}
