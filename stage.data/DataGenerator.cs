using System.Collections.Generic;
using System;
using stage.domain;
using stage.data.formulas;

namespace stage.data {
    public class DataGenerator {

        // Per day 96 quarters (15 minutes)
        public static List<Snapshot> GenerateLinearData(int countQuarters) {
            List<Snapshot> output = new List<Snapshot>();

            // Start time is today at 00:00 AM
            DateTime now = DateTime.Now;
            DateTime time = new DateTime(now.Year, now.Month, now.Day, 0, 0, 0);

            // Chainsaw like formula is used for the linear data. The temp at 00:00 is 19.5 degree
            Chainsaw formula = new Chainsaw(0.10, 0.25, 23, 18, 19.5);
            for (int i = 0; i < countQuarters; i++) {
                output.Add(new Snapshot {
                    When = time,
                    Value = formula.next(),
                    HeatingPercentage = formula.isActivelyHeating() ? 1 : 0,
                    CoolingPercentage = formula.isActivelyCooling() ? 1 : 0,
                });

                time = time.AddMinutes(15);
            }

            return output;
        }
    }
}
