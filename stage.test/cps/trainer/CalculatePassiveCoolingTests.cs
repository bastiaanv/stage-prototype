using System.Collections.Generic;
using stage.cps;
using stage.domain;
using Xunit;

namespace stage.test.cps.trainer {
    public class CalculatePassiveCoolingTests {
        [Fact]
        public void ShouldReturnZeroAsDefault() {
            List<Snapshot> snapshots = new List<Snapshot>();
            
            double actual = Trainer.CalculatePassiveCooling(snapshots);
            double excepted = 0;
            
            Assert.Equal(excepted, actual);
        }

        [Fact]
        public void ShouldReturnAverageOverallSnapshots() {
            List<Snapshot> snapshots = new List<Snapshot> {
                new Snapshot {
                    
                }
            };
        }
    }
}