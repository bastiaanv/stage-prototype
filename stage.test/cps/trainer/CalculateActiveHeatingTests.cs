using System;
using System.Collections.Generic;
using stage.cps;
using stage.domain;
using Xunit;

namespace stage.test.cps.trainer {
    public class CalculateActiveHeatingTests {
        [Fact]
        public void ShouldReturnZeroAsDefault() {
            List<Snapshot> snapshots = new List<Snapshot>();
            
            double actual = Trainer.CalculateActiveHeating(snapshots);
            double excepted = 0;
            
            Assert.Equal(excepted, actual);
        }

        [Fact]
        public void ShouldReturnAverageOverallSnapshots() {
            List<Snapshot> snapshots = new List<Snapshot> {
                new Snapshot {
                    When = new DateTime(2020, 01, 01, 0, 0, 0),
                    Value = 16.5,
                    HeatingPercentage = 1,
                    CoolingPercentage = 0,
                },
                new Snapshot {
                    When = new DateTime(2020, 01, 01, 0, 15, 0),
                    Value = 16.8,
                    HeatingPercentage = 1,
                    CoolingPercentage = 0,
                },
                new Snapshot {
                    When = new DateTime(2020, 01, 01, 0, 30, 0),
                    Value = 17.0,
                    HeatingPercentage = 1,
                    CoolingPercentage = 0,
                },
                new Snapshot {
                    When = new DateTime(2020, 01, 01, 0, 45, 0),
                    Value = 17.2,
                    HeatingPercentage = 1,
                    CoolingPercentage = 0,
                },
            };

            double actual = Trainer.CalculateActiveHeating(snapshots);
            double excepted = 0.7/3;

            Assert.Equal(excepted, actual, 5);
        }

        [Fact]
        public void ShouldReturnAverageOverallSnapshotsWithoutTheActiveMoments() {
            List<Snapshot> snapshots = new List<Snapshot> {
                new Snapshot {
                    When = new DateTime(2020, 01, 01, 0, 0, 0),
                    Value = 16.5,
                    HeatingPercentage = 1,
                    CoolingPercentage = 0,
                },
                new Snapshot {
                    When = new DateTime(2020, 01, 01, 0, 15, 0),
                    Value = 16.8,
                    HeatingPercentage = 0,
                    CoolingPercentage = 0,
                },
                new Snapshot {
                    When = new DateTime(2020, 01, 01, 0, 30, 0),
                    Value = 17.0,
                    HeatingPercentage = 1,
                    CoolingPercentage = 0,
                },
                new Snapshot {
                    When = new DateTime(2020, 01, 01, 0, 45, 0),
                    Value = 17.2,
                    HeatingPercentage = 1,
                    CoolingPercentage = 0,
                },
            };

            double actual = Trainer.CalculateActiveHeating(snapshots);
            double excepted = 0.5/2;

            Assert.Equal(excepted, actual, 5);
        }
    }
}