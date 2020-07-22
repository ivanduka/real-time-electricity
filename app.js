const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sql = require('mssql/msnodesqlv8');
require('dotenv').config();
const rateLimit = require('express-rate-limit');

const config = {
  database: process.env.DB_NAME,
  server: process.env.DB_HOST,
  options: {
    trustedConnection: true,
  },
};

const apiLimiter = rateLimit({
  windowMs: process.env.RATE_LIMITING_WINDOW_IN_SECONDS * 1000, // in milliseconds
  max: process.env.RATE_LIMITING_LIMIT_PER_WINDOW, // requests per windowMs
});

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
};

const dataStore = {};

const fetchData = async (type) => {
  await sql.connect(config);
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
app.disable('etag');

app.use(cors());
app.get('/api/', (req, res, next) => apiLimiter(req, res, next));
app.use('/', express.static('public'));
app.use(bodyParser.json());
app.get('/api/:type', (req, res, next) => apiController(req, res, next));
app.use((err, req, res, next) => errorHandler(err, req, res, next));

(async () => {
  await populateDataStore();
  // eslint-disable-next-line no-console
  app.listen(process.env.PORT, () => console.log(`Listening on port ${process.env.PORT}...`));
})();
