import * as sql from 'mssql';
import { Snapshot } from '../domain/snapshot.model';

export class DataImporter {
    private database?: sql.ConnectionPool = undefined;
    private readonly config: sql.config = {
        user: process.env.DB_USER as string,
        password: process.env.DB_PASSWORD as string,
        server: process.env.DB_HOST as string,
        database: process.env.DB_DATABASE as string,
        port: +(process.env.DB_PORT as string)
    }

    public connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.database = new sql.ConnectionPool(this.config, err => {
                if (err) {
                    console.error('Connection failed.', err);
                    reject(err);
                } else {
                    console.log('Connected!!');
                    resolve();
                }
            });
        });
    }

    public disconnect() {
        return this.database?.close()
    }

    public async getSnapshots(): Promise<Snapshot[]> {
        const query = ` SELECT
                                t.Systeemtijd AS Systeemtijd,
                                CAST(t.Waarde AS FLOAT)/10 AS Temperatuur,
                                h.Waarde AS SturingVerwarming,
                                c.Waarde AS SturingKoeling
                        FROM [FS\\GBS].BREIJER_OS1_GRFMET_38 AS t
                        INNER JOIN [FS\\GBS].Breijer_OS1_GRFSYS_45 AS c ON t.Systeemtijd = c.Systeemtijd
                        INNER JOIN [FS\\GBS].Breijer_OS1_GRFSYS_44 AS h ON h.Systeemtijd = t.Systeemtijd
                        WHERE
                            t.Systeemtijd >= DATEADD(MONTH, -3, GETDATE());`;

        const request = new sql.Request(this.database);

        return (await request.query(query)).recordset as Snapshot[];
    }
}