import * as sql from 'mssql';
import { Snapshot } from '../domain/snapshot.model';
import { readFileSync } from 'fs';
import * as path from 'path';

export class DataImporter {
    private database?: sql.ConnectionPool = undefined;
    private readonly config: sql.config = {
        user: process.env.DB_USER as string,
        password: process.env.DB_PASSWORD as string,
        server: process.env.DB_HOST as string,
        database: process.env.DB_DATABASE as string,
        port: +(process.env.DB_PORT as string),
        options: {
            enableArithAbort: true,
        },
    };

    public connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.database = new sql.ConnectionPool(this.config, async (err) => {
                if (err) {
                    console.error('Connection failed.', err);
                    reject(err);
                } else {
                    console.log('connected!!');
                    resolve();
                }
            });
        });
    }

    public disconnect() {
        return this.database?.close();
    }

    public async getSnapshots(): Promise<Snapshot[]> {
        const data = await this.getDataFromDB();
        return this.readClimatData(data);
    }

    private readClimatData(data: Snapshot[]): Snapshot[] {
        const csvString = readFileSync(path.resolve(__dirname, 'csv', 'data.csv')).toString();

        for (const row of csvString.split('\n')) {
            if (row === '' || row === 'when, temp, solar radiation, humidity, wind speed, wind direction, rainfall') {
                continue;
            }

            const rowSplitted = row.split(',');
            const index = data.findIndex(x => x.when.getTime() === new Date(rowSplitted[0]).getTime());
            if (index != -1) {
                data[index].outside = {
                    temperature: parseFloat(rowSplitted[1]),
                    solarRadiation: parseFloat(rowSplitted[2]),
                    humidity: parseFloat(rowSplitted[3]),
                    windSpeed: parseFloat(rowSplitted[4]),
                    windDirection: parseFloat(rowSplitted[5]),
                    rainfall: parseFloat(rowSplitted[6]),
                };
            }
        }

        return data;
    }

    private async getDataFromDB(): Promise<Snapshot[]> {
        const query = ` SELECT
                            DATEADD(MINUTE, DATEDIFF(MINUTE, '2000', t.[Systeemtijd]) / 15 * 15, '2000') AS 'when',
                            CAST(AVG(t.Waarde) AS FLOAT) / 10 AS 'temperature',
                            CAST(MAX(h.Waarde) AS FLOAT) / 10000 AS 'heatingPercentage',
                            CAST(MAX(c.Waarde) AS FLOAT) / 10000 AS 'coolingPercentage'
                        FROM [FS\\GBS].${process.env.TABLE_TEMP} AS t
                        INNER JOIN [FS\\GBS].${process.env.TABLE_COOLING} AS c ON t.Systeemtijd = c.Systeemtijd
                        INNER JOIN [FS\\GBS].${process.env.TABLE_HEATING} AS h ON t.Systeemtijd = h.Systeemtijd
                        WHERE
                            t.Systeemtijd >= DATEADD(MONTH, -3, GETDATE())
                        GROUP BY DATEADD(MINUTE, DATEDIFF(MINUTE, '2000', t.[Systeemtijd]) / 15 * 15, '2000')
                        ORDER BY 'when' ASC;`;

        const request = new sql.Request(this.database);
        return (await request.query(query)).recordset as Snapshot[];
    }
}
