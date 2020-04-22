export class MemoryCPS {
    private readonly memory: MemoryData[] = [];
    private readonly limit = 1000;

    public add(data: MemoryData): void {
        if (this.memory.length === this.limit) {
            this.memory.splice(0, 1);
        }

        this.memory.push(data);
    }

    public getLastData(count: number): MemoryData[] {
        return this.memory.slice(this.memory.length - count, this.memory.length);
    }

    public print(count?: number): void {
        count ? console.log(this.getLastData(count)) : console.log(this.memory);
    }
}

export interface MemoryData {
    temperature: number;
    outsideTemperature: number;
    date: Date;
    action: number;
}
