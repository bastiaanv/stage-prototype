export class Normalization {
    public static temperature(temperature: number): number {
        return (temperature + 20) / 60;
    }

    public static reward(reward: number, max: number): number {
        return reward / max;
    }
}
