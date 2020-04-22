import * as sql from 'mssql';
import { Snapshot } from '../domain/snapshot.model';

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

                    // Check if function for cooling normalization exists. If not, it will be created
                    const checkFunction = `SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[FS\\GBS].[CoolingFunction]') AND type = N'FN'`;
                    const request = new sql.Request(this.database);

                    if((await request.query(checkFunction)).recordset.length !== 1) {
                        const createFunction = `CREATE FUNCTION [FS\\GBS].CoolingFunction(@val1 int) RETURNS INT AS BEGIN if @val1 > 1 return 1 return @val1 END;`;
                        await request.query(createFunction);
                    }

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
        const query = ` SELECT
                            DATEADD(MINUTE, DATEDIFF(MINUTE, '2000', t.[Systeemtijd]) / 15 * 15, '2000') AS 'when',
                            CAST(AVG(t.Waarde) AS FLOAT) / 10 AS 'temperature',
                            MAX(h.Waarde) AS 'heatingPercentage',
                            [FS\GBS].CoolingFunction(MAX(c.Waarde)) AS coolingPercentage
                        FROM [FS\GBS].BREIJER_OS1_GRFMET_39 AS t
                        INNER JOIN [FS\GBS].BREIJER_OS1_GRFSYS_48 AS c ON t.Systeemtijd = c.Systeemtijd
                        INNER JOIN [FS\GBS].BREIJER_OS1_GRFSYS_47 AS h ON h.Systeemtijd = t.Systeemtijd
                        WHERE
                            t.Systeemtijd >= DATEADD(MONTH, -3, GETDATE())
                        GROUP BY DATEADD(MINUTE, DATEDIFF(MINUTE, '2000', t.[Systeemtijd]) / 15 * 15, '2000')
                        ORDER BY 'when' DESC;`;

        const request = new sql.Request(this.database);
        return (await request.query(query)).recordset as Snapshot[];
    }
}
