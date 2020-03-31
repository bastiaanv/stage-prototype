export class LSTMMemory {
    private readonly memory: number[][] = [];
    private readonly memorySize = 10000;

    public add(temperatureNormalized: number) {
        if (temperatureNormalized > 1 || temperatureNormalized < 0) {
            throw new Error('Temperature is not normalized...');
        }

        this.memory.unshift([temperatureNormalized]);

        if (this.memory.length  > this.memorySize) {
            this.memory.pop();
        }
    }

    public get(length: number): number[][] {
        if (this.memory.length >= length) {
            return this.memory.slice(0, length);

        } else {
            while (this.memory.length !== length) {
                this.memory.push([0]);
            }

            return this.memory;
        }
    }

    public clear() {
        this.memory.length = 0
    }
}
