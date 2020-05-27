import * as sql from 'mssql';
import { Snapshot } from '../domain/snapshot.model';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { request, RequestOptions } from 'http';
import { soap } from 'strong-soap';
import moment from 'moment';

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

    /**
     * Connects to the database
     */
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

    /**
     * Disconnects from the database
     */
    public disconnect() {
        return this.database?.close();
    }

    /**
     * Gets the data from the database (Priva history data) and SOA-Service (KNMI data)
     */
    public async getSnapshots(): Promise<Snapshot[]> {
        let data = await this.getDataFromDB();
        data = this.readOccupancyFromCsv(data);

        // Check if SOA-Service is available, otherwise use csv file in this project. This address is only available within the Facilicom network
        return this.httpRequest({method: 'HEAD', host: process.env.SOA_SERVICE_HOST, port: +process.env.SOA_SERVICE_PORT!}).then(() => {
            return this.readKNMIFromSoap(data);

        }).catch(() => {
            return this.readKNMIFromCsv(data);
        });
    }

    private readOccupancyFromCsv(data: Snapshot[]): Snapshot[] {
        const csvString = readFileSync(resolve(__dirname, 'csv', 'occupancy.csv')).toString();

        const csvData: {begin: Date, end: Date}[] = [];
        for (const row of csvString.split('\n')) {
            if (row === '' || row === 'begin, end') {
                continue;
            }

            const rowSplitted = row.split(',');
            csvData.push({begin: new Date(rowSplitted[0]), end: new Date(rowSplitted[1])});
        }
        
        data.forEach((x) => {
            x.occupied = !!csvData.find((y) => y.begin.getTime() < x.when.getTime() && y.end.getTime() > x.when.getTime());
        });

        return data;
    }

    private readKNMIFromSoap(data: Snapshot[]): Promise<Snapshot[]> {
        return new Promise<Snapshot[]>((resolve, reject) => {
            soap.createClient(`${process.env.SOA_SERVICE_HOST}/VolumeService/VolumeService.svc?singleWsdl`, {}, async (err, client) => {
                if (err) {
                    reject(err);
                }
            
                const getClimateData: (options: any) => { GetClimateDataResult: { MeasureDataResponseMessage: {PeriodEnd: Date, PeriodStart: Date, Volume: number}[] } } = client['VolumeServiceHandler']['BasicHttpBinding_IVolumeService']['GetClimateData'];
                const postalCode = '3007GA';
                const start = moment(data[0].when).format('YYYY-MM-DDTHH:mm:ss');
                const end = moment(data[data.length-1].when).format('YYYY-MM-DDTHH:mm:ss');
                
                const [
                    temp,
                    solarRadiation,
                    humidity,
                    windSpeed,
                    windDirection,
                    rainfall
                ] = await Promise.all([
                    getClimateData(generateParams('Temperatuur', start, end, postalCode)),
                    getClimateData(generateParams('Globale_straling', start, end, postalCode)),
                    getClimateData(generateParams('Relatieve_vochtigheid', start, end, postalCode)),
                    getClimateData(generateParams('Uurgemiddelde_windsnelheid', start, end, postalCode)),
                    getClimateData(generateParams('Windrichting', start, end, postalCode)),
                    getClimateData(generateParams('Uursom_neerslag', start, end, postalCode)),
                ]);
            
                for (let i = 0; i < data.length; i++) {
                    const index = temp.GetClimateDataResult.MeasureDataResponseMessage.findIndex(x => x.PeriodStart.getTime() === data[i].when.getTime());
                    
                    data[i].outside = {
                        temperature: temp.GetClimateDataResult.MeasureDataResponseMessage[index].Volume,
                        solarRadiation: solarRadiation.GetClimateDataResult.MeasureDataResponseMessage[index].Volume,
                        humidity: humidity.GetClimateDataResult.MeasureDataResponseMessage[index].Volume,
                        windSpeed: windSpeed.GetClimateDataResult.MeasureDataResponseMessage[index].Volume,
                        windDirection: windDirection.GetClimateDataResult.MeasureDataResponseMessage[index].Volume,
                        rainfall: rainfall.GetClimateDataResult.MeasureDataResponseMessage[index].Volume,
                    };
                }

                resolve(data);
            });
        });

        function generateParams(type: string, start: string, end: string, postalCode: string) {
            return {
                message: {
                    LocationID: null,
                    PostalCode: postalCode,
                    PeriodStart: start,
                    PeriodEnd: end,
                    ClimateType: type,
                } 
            };
        }
    }

    private readKNMIFromCsv(data: Snapshot[]): Snapshot[] {
        const csvString = readFileSync(resolve(__dirname, 'csv', 'knmi.csv')).toString();

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

    /**
     * The method can be used to test a connection to a REST/SOAP service. Mostly used to test if a Facilicom service is reachable from the current location
     * @param requestOptions
     * @returns Promise<void> when successful returns a void, when fails it throws an exception
     */
    private httpRequest(requestOptions: RequestOptions): Promise<void> {
        return new Promise(function(resolve, reject) {
            const req = request(requestOptions, (res) => {
                res.on('end', () => {
                    resolve();
                });

                res.on('error', () => {
                    resolve();
                })
            });

            req.on('error', function(err) {
                reject(err);
            });

            req.end();
        });
    }
}
