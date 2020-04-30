-- FIRST COPY THE BAK FILE INTO THE DOCKER CONTAINER USING: sudo docker cp TCH_Breijer.bak {CONTAINER_ID}:/

USE [master]
RESTORE DATABASE TCH_BREIJER
FROM DISK = '/var/opt/mssql//TCH_Breijer.bak'
WITH
  FILE = 1,
  NOUNLOAD,
  REPLACE,
  STATS = 5,
  MOVE 'TCH_BREIJER' TO '/var/opt/mssql/data/TCH_BREIJER.mdf',
  MOVE 'TCH_BREIJER_log' TO '/var/opt/mssql/data/TCH_BREIJER_log.ldf'
GO
