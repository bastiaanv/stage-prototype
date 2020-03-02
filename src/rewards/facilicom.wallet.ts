import { FacilicomCoin } from './facilicom.coin';

export class FacilicomWallet {
    private readonly coins: FacilicomCoin[] = [];
    private lengthLastAdd: number = 0;

    public add(coin: FacilicomCoin | FacilicomCoin[]): void {
        Array.isArray(coin) ? this.coins.push(...coin) : this.coins.push(coin);
        this.lengthLastAdd = Array.isArray(coin) ? coin.length : 1;
    }

    public getTotalValue(): number {
        return this.coins.reduce((a, b) => a + b.value, 0);
    }

    public getLastValue(): number {
        let output = 0;
        for (let i = 0; i < this.lengthLastAdd; i++) {
            const coin = this.coins[this.coins.length - 1 - i];
            output += coin.value;
        }

        return output;
    }
}