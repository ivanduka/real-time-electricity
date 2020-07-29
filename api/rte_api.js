const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sql = require('mssql/msnodesqlv8');
require('dotenv').config();
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: process.env.RATE_LIMITING_WINDOW_IN_SECONDS * 1000, // in milliseconds
  max: process.env.RATE_LIMITING_LIMIT_PER_WINDOW, // requests per windowMs
});

const connectionString = `DSN=${process.env.ODBC_NAME}`;

const queries = {
  'ab-rt-fc-price': [`
    SELECT TOP 30 "DateTime", "Forecast Pool Price", "Actual Posted Pool Price"
    FROM AESO_ActualForecast
    WHERE "Forecast Pool Price" IS NOT NULL
    ORDER BY DateTime DESC;
  `],
  'ab-rt-fc-demand': [`
    SELECT TOP 100 "DateTime", "Day-Ahead Forecasted AIL", "Actual AIL"
    FROM AESO_ActualForecast
    ORDER BY DateTime DESC;
  `],
  'ab-ht-price_hourly': [`
    SELECT TOP 100 "DateTime", "Price ($)", "30Ravg ($)"
    FROM AESO_PoolPrice
    ORDER BY DateTime DESC;
  `],
  'ab-rt-demand_supply': [`
      SELECT TOP 30 "DateTime", "Value (MW)"
      FROM AESO_Summary
      WHERE Category='Alberta Internal Load (AIL)'
      ORDER BY DateTime DESC;
    `, `
      SELECT TOP 30 "DateTime", "Value (MW)"
      FROM AESO_Summary
      WHERE Category='Alberta Total Net Generation'
      ORDER BY DateTime DESC;
    `],
  'ab-rt-interchange': [`
      SELECT TOP 30 "DateTime", "Actual Flow (MW)"
      FROM AESO_Interchange
      WHERE Path='British Columbia'
      ORDER BY DateTime DESC;
    `, `
      SELECT TOP 30 "DateTime", "Actual Flow (MW)"
      FROM AESO_Interchange
      WHERE Path='Montana'
      ORDER BY DateTime DESC;
    `, `
      SELECT TOP 30 "DateTime", "Actual Flow (MW)"
      FROM AESO_Interchange
      WHERE Path='Saskatchewan'
      ORDER BY DateTime DESC;
    `, `
      SELECT TOP 30 "DateTime", "Actual Flow (MW)"
      FROM AESO_Interchange
      WHERE Path='TOTAL'
      ORDER BY DateTime DESC;
      `],
  'ab-rt-capability': [`
      SELECT TOP 100 DateTime, SUM([Maximum Capability (MW)]) AS TotalMaxWindCapability
      FROM AESO_Generation
      WHERE Fuel='WIND'
      GROUP BY DateTime
      ORDER BY DateTime DESC;
    `, `
      SELECT TOP 100 DateTime, SUM([Maximum Capability (MW)]) AS TotalMaxWindCapability
      FROM AESO_Generation
      WHERE Fuel='BIOMASS AND OTHER'
      GROUP BY DateTime
      ORDER BY DateTime DESC;
    `, `
      SELECT TOP 100 DateTime, SUM([Maximum Capability (MW)]) AS TotalMaxWindCapability
      FROM AESO_Generation
      WHERE Fuel='GAS'
      GROUP BY DateTime
      ORDER BY DateTime DESC;
    `, `
      SELECT TOP 100 DateTime, SUM([Maximum Capability (MW)]) AS TotalMaxWindCapability
      FROM AESO_Generation
      WHERE Fuel='HYDRO'
      GROUP BY DateTime
      ORDER BY DateTime DESC;
    `, `
      SELECT TOP 100 DateTime, SUM([Maximum Capability (MW)]) AS TotalMaxWindCapability
      FROM AESO_Generation
      WHERE Fuel='COAL'
      GROUP BY DateTime
      ORDER BY DateTime DESC;
    `, `
      SELECT TOP 100 DateTime, SUM([Maximum Capability (MW)]) AS TotalMaxWindCapability
      FROM AESO_Generation
      WHERE Fuel='TOTAL'
      GROUP BY DateTime
      ORDER BY DateTime DESC;
    `],
  'ab-rt-generation': [`
        SELECT TOP 100 DateTime, SUM([Total Net Generation (MW)]) AS TotalMaxWindCapability
        FROM AESO_Generation
        WHERE Fuel='WIND'
        GROUP BY DateTime
        ORDER BY DateTime DESC;
    `, `
        SELECT TOP 100 DateTime, SUM([Total Net Generation (MW)]) AS TotalMaxWindCapability
        FROM AESO_Generation
        WHERE Fuel='BIOMASS AND OTHER'
        GROUP BY DateTime
        ORDER BY DateTime DESC;
    `, `
        SELECT TOP 100 DateTime, SUM([Total Net Generation (MW)]) AS TotalMaxWindCapability
        FROM AESO_Generation WHERE Fuel='GAS'
        GROUP BY DateTime
        ORDER BY DateTime DESC;
    `, `
        SELECT TOP 100 DateTime, SUM([Total Net Generation (MW)]) AS TotalMaxWindCapability
        FROM AESO_Generation
        WHERE Fuel='HYDRO'
        GROUP BY DateTime
        ORDER BY DateTime DESC;
    `, `
        SELECT TOP 100 DateTime, SUM([Total Net Generation (MW)]) AS TotalMaxWindCapability
        FROM AESO_Generation
        WHERE Fuel='COAL'
        GROUP BY DateTime
        ORDER BY DateTime DESC;
    `, `
        SELECT TOP 100 DateTime, SUM([Total Net Generation (MW)]) AS TotalMaxWindCapability
        FROM AESO_Generation
        WHERE Fuel='TOTAL'
        GROUP BY DateTime
        ORDER BY DateTime DESC;
    `],
  'on-rt-demand': [`
    SELECT TOP 30 DateTime, "Total Energy (MW)", "Total Loss (MW)", "Total Load (MW)", "ONTARIO DEMAND (MW)"
    FROM IESO_Summary
    ORDER BY DateTime DESC;
  `],
  'on-rt-supply-cap': [
    "SELECT TOP 100 DateTime, SUM([Capability (MW)]) AS TotalCapability FROM IESO_Generators WHERE Fuel='BIOFUEL' GROUP BY DateTime ORDER BY DateTime DESC",
    "SELECT TOP 100 DateTime, SUM([Capability (MW)]) AS TotalCapability FROM IESO_Generators WHERE Fuel='GAS' GROUP BY DateTime ORDER BY DateTime DESC",
    "SELECT TOP 100 DateTime, SUM([Capability (MW)]) AS TotalCapability FROM IESO_Generators WHERE Fuel='HYDRO' GROUP BY DateTime ORDER BY DateTime DESC",
    "SELECT TOP 100 DateTime, SUM([Capability (MW)]) AS TotalCapability FROM IESO_Generators WHERE Fuel='NUCLEAR' GROUP BY DateTime ORDER BY DateTime DESC",
    "SELECT TOP 100 DateTime, SUM([Capability (MW)]) AS TotalCapability FROM IESO_Generators WHERE Fuel='SOLAR' GROUP BY DateTime ORDER BY DateTime DESC",
    "SELECT TOP 100 DateTime, SUM([Capability (MW)]) AS TotalCapability FROM IESO_Generators WHERE Fuel='WIND' GROUP BY DateTime ORDER BY DateTime DESC",
  ],
  'on-rt-supply-out': [
    "SELECT TOP 100 DateTime, SUM([Output (MW)]) AS TotalOutput FROM IESO_Generators WHERE Fuel='BIOFUEL' GROUP BY DateTime ORDER BY DateTime DESC",
    "SELECT TOP 100 DateTime, SUM([Output (MW)]) AS TotalOutput FROM IESO_Generators WHERE Fuel='GAS' GROUP BY DateTime ORDER BY DateTime DESC",
    "SELECT TOP 100 DateTime, SUM([Output (MW)]) AS TotalOutput FROM IESO_Generators WHERE Fuel='HYDRO' GROUP BY DateTime ORDER BY DateTime DESC",
    "SELECT TOP 100 DateTime, SUM([Output (MW)]) AS TotalOutput FROM IESO_Generators WHERE Fuel='NUCLEAR' GROUP BY DateTime ORDER BY DateTime DESC",
    "SELECT TOP 100 DateTime, SUM([Output (MW)]) AS TotalOutput FROM IESO_Generators WHERE Fuel='SOLAR' GROUP BY DateTime ORDER BY DateTime DESC",
    "SELECT TOP 100 DateTime, SUM([Output (MW)]) AS TotalOutput FROM IESO_Generators WHERE Fuel='WIND' GROUP BY DateTime ORDER BY DateTime DESC",
  ],
  'on-rt-interchange-actual': [
    "SELECT TOP 30 DateTime, [Flow (MWh)] FROM IESO_ActualFlows WHERE Zone='MANITOBA' ORDER BY DateTime DESC",
    "SELECT TOP 30 DateTime, [Flow (MWh)] FROM IESO_ActualFlows WHERE Zone='MANITOBA SK' ORDER BY DateTime DESC",
    "SELECT TOP 30 DateTime, [Flow (MWh)] FROM IESO_ActualFlows WHERE Zone='MICHIGAN' ORDER BY DateTime DESC",
    "SELECT TOP 30 DateTime, [Flow (MWh)] FROM IESO_ActualFlows WHERE Zone='MINNESOTA' ORDER BY DateTime DESC",
    "SELECT TOP 30 DateTime, [Flow (MWh)] FROM IESO_ActualFlows WHERE Zone='NEW-YORK' ORDER BY DateTime DESC",
    "SELECT TOP 30 DateTime, [Flow (MWh)] FROM IESO_ActualFlows WHERE Zone='Total' ORDER BY DateTime DESC",
  ],
  'on-rt-interchange-sched': [
    "SELECT TOP 30 DateTime, [Exports (MWh)] FROM IESO_ScheduledFlows WHERE Zone='Total' ORDER BY DateTime DESC",
    "SELECT TOP 30 DateTime, [Imports (MWh)] FROM IESO_ScheduledFlows WHERE Zone='Total' ORDER BY DateTime DESC",
  ],
  'on-rt-interchange-sched-v2': [
    "SELECT TOP 30 DateTime, [Exports (MWh)] FROM IESO_ScheduledFlows WHERE Zone='MANITOBA' ORDER BY DateTime DESC",
    "SELECT TOP 30 DateTime, [Exports (MWh)] FROM IESO_ScheduledFlows WHERE Zone='MANITOBA SK' ORDER BY DateTime DESC",
    "SELECT TOP 30 DateTime, [Exports (MWh)] FROM IESO_ScheduledFlows WHERE Zone='MICHIGAN' ORDER BY DateTime DESC",
    "SELECT TOP 30 DateTime, [Exports (MWh)] FROM IESO_ScheduledFlows WHERE Zone='MINNESOTA' ORDER BY DateTime DESC",
    "SELECT TOP 30 DateTime, [Exports (MWh)] FROM IESO_ScheduledFlows WHERE Zone='NEW-YORK' ORDER BY DateTime DESC",
    "SELECT TOP 30 DateTime, [Exports (MWh)] FROM IESO_ScheduledFlows WHERE Zone='Total' ORDER BY DateTime DESC",
  ],
  'on-rt-price': [
    'SELECT TOP 30 DateTime, "HOEP ($/MWh)" FROM IESO_HOEP ORDER BY DateTime DESC;',
  ],
  'ns-rt-demand': [
    'SELECT TOP 30 DateTime, [Net Load] FROM NSPower_SystemInformation ORDER BY DateTime DESC',
    'SELECT TOP 30 DateTime,  [Wind Generation] FROM NSPower_SystemInformation ORDER BY DateTime DESC',
  ],
  'ns-rt-interchange': [`
    SELECT TOP 30 DateTime, [Highlands Export], [East End Export (at Sydney)], [East End Export (at East Bay)],
                  [Cape Breton Export], [Onslow Import], [NS Export], [Flow Into Metro], [Onslow South]
                  [Western Import], [Valley Import], [Maritime Link Import]
    FROM NSPower_SystemInformation ORDER BY DateTime DESC;
  `],
  'nb-rt-demand': [
    'SELECT TOP 30 DateTime, [NB Load] FROM NBPower_SystemInformation ORDER BY DateTime DESC',
    'SELECT TOP 30 DateTime,  [NB Demand] FROM NBPower_SystemInformation ORDER BY DateTime DESC',
  ],
  'nb-rt-interchange': [`
    SELECT TOP 30 DateTime, [East End Export (at Sydney)], [East End Export (at East Bay)],
                  [Cape Breton Export], [Onslow Import], [NS Export], [Onslow South]
    FROM NSPower_SystemInformation ORDER BY DateTime DESC;
  `],
  'nl-rt-supply': [
    'SELECT TOP 30 DateTime, [Generation (MW)] FROM Nlhydro_SystemInformation ORDER BY DateTime DESC',
  ],
  'pei-rt-supply-demand': [`
    SELECT TOP 30 DateTime, [Total Load (MW)], [Wind Power Used (MW)], [Total Wind Generation (MW)],
    [Wind Power Exported (MW)], [Total Fossil Fuel Generation (MW)]
    FROM PEI_SystemInformation ORDER BY DateTime DESC
  `],
};

const dataStore = {};

const fetchData = async (type) => {
  await sql.connect(connectionString);
  const promises = queries[type].map((q) => sql.query(q));
  const results = await Promise.all(promises);
  return results.map((result) => result.recordset);
};

const populateDataStore = async () => {
  const promises = {};
  // eslint-disable-next-line no-restricted-syntax, guard-for-in
  for (const type in queries) {
    promises[type] = fetchData(type);
  }

  // eslint-disable-next-line no-restricted-syntax, guard-for-in
  for (const type in promises) {
    // eslint-disable-next-line no-await-in-loop
    dataStore[type] = await promises[type]; // waiting for promises, so it's OK to await here
  }
};

setInterval(populateDataStore, process.env.DB_UPDATE_INTERVAL_IN_SECONDS * 1000);

const apiController = async (req, res, next) => {
  try {
    if (!queries[req.params.type]) {
      next(new Error(`wrong parameter: ${req.params.type}`));
      return;
    }
    const result = dataStore[req.params.type];
    res.json(result);
  } catch (error) {
    next(error);
  }
};

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    next(err);
    return;
  }
  res.statusMessage = err.message.replace(/[^\t\x20-\x7e\x80-\xff]/, '_');
  res.status(500)
    .send();
  // eslint-disable-next-line no-console
  console.log(err);
}

const app = express();
app.set('trust proxy', 1);
app.get('/api/', (req, res, next) => apiLimiter(req, res, next));
app.disable('etag');
app.use(cors());
app.use(bodyParser.json());
app.get('/api/:type', (req, res, next) => apiController(req, res, next));
app.use((err, req, res, next) => errorHandler(err, req, res, next));

(async () => {
  await populateDataStore();
  // eslint-disable-next-line no-console
  app.listen(process.env.PORT, () => console.log(`Listening on port ${process.env.PORT}...`));
})();
