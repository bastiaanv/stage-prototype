// Formula: N = (x - min) / (max - min)

export class Normalization {
    /**
     * A normalization function to normalize a temperature between -20 degrees and 40 degrees celsius
     * @param temperature The non-normalized temperatuur
     * @returns Normalized temperature (between 0 and 1)
     */
    public static temperature(temperature: number): number {
        return (temperature + 20) / 60;
    }

    /**
     * A normalization function to normalize the reward. The value need to be between 0 and @param reward
     * @param reward The reward given by the rewardsystem
     * @param max The maximum the reward system can given
     * @returns Normalized reward (between 0 and 1)
     */
    public static reward(reward: number, max: number): number {
        return reward / max;
    }

    /**
     * A time normalization. This will make sure the time (per minute) will be normalized. Max = 24*60 = 1440. Min = 0
     * @param date The date that needs to be normalized
     * @returns Normalized time (between 0 and 1)
     */
    public static time(date: Date): number {
        return (date.getHours() * 60 + date.getMinutes()) / 1440;
    }

    /**
     * A date normalization. This will make sure the date will be normalized. Max = 7. Min = 0
     * @param date The date that needs to be normalized
     * @returns Normalized date (between 0 and 1)
     */
    public static date(date: Date): number {
        return date.getDay() / 7;
    }
}
