const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const sql = require('mssql/msnodesqlv8');
const { EventEmitter } = require('events');
require('dotenv').config();

const app = express();
app.use(cors());
app.use('/', express.static('public'));

const config = {
  database: process.env.DB_NAME,
  server: process.env.DB_HOST,
  options: {
    trustedConnection: true,
  },
};

class Lock {
  constructor() {
    this.locked = false;
    this.ee = new EventEmitter();
  }

  acquire() {
    return new Promise((resolve) => {
      // If nobody has the lock, take it and resolve immediately
      if (!this.locked) {
        // Safe because JS doesn't interrupt you on synchronous operations,
        // so no need for compare-and-swap or anything like that.
        this.locked = true;
        return resolve();
      }

      // Otherwise, wait until somebody releases the lock and try again
      const tryAcquire = () => {
        if (!this.locked) {
          this.locked = true;
          this.ee.removeListener('release', tryAcquire);
          resolve();
        }
      };
      return this.ee.on('release', tryAcquire);
    });
  }

  release() {
    // Release the lock immediately
    this.locked = false;
    setImmediate(() => this.ee.emit('release'));
  }
}

const queries = {
  'ab-rt-fc-price': [
    `
    SELECT TOP 30 "DateTime", "Forecast Pool Price", "Actual Posted Pool Price"
    FROM AESO_ActualForecast
    WHERE "Forecast Pool Price" IS NOT NULL
    ORDER BY DateTime DESC;`,
  ],
  'ab-rt-fc-demand': [
    `
    SELECT TOP 100 "DateTime", "Day-Ahead Forecasted AIL", "Actual AIL"
    FROM AESO_ActualForecast
    ORDER BY DateTime DESC;`,
  ],
  'ab-ht-price_hourly': [
    `
    SELECT TOP 100 "DateTime", "Price ($)", "30Ravg ($)"
    FROM AESO_PoolPrice
    ORDER BY DateTime DESC;`,
  ],
  'ab-rt-demand_supply': [
    `
      SELECT TOP 30 "DateTime", "Value (MW)"
      FROM AESO_Summary
      WHERE Category='Alberta Internal Load (AIL)'
      ORDER BY DateTime DESC;
    `,
    `
      SELECT TOP 30 "DateTime", "Value (MW)"
      FROM AESO_Summary
      WHERE Category='Alberta Total Net Generation'
      ORDER BY DateTime DESC;
    `,
  ],
  'ab-rt-interchange': [
    `
      SELECT TOP 30 "DateTime", "Actual Flow (MW)"
      FROM AESO_Interchange
      WHERE Path='British Columbia'
      ORDER BY DateTime DESC;
    `,
    `
      SELECT TOP 30 "DateTime", "Actual Flow (MW)"
      FROM AESO_Interchange
      WHERE Path='Montana'
      ORDER BY DateTime DESC;
    `,
    `
      SELECT TOP 30 "DateTime", "Actual Flow (MW)"
      FROM AESO_Interchange
      WHERE Path='Saskatchewan'
      ORDER BY DateTime DESC;
    `,
    `
      SELECT TOP 30 "DateTime", "Actual Flow (MW)"
      FROM AESO_Interchange
      WHERE Path='TOTAL'
      ORDER BY DateTime DESC;`,
  ],
  'ab-rt-capability': [
    `
      SELECT TOP 100 DateTime, SUM([Maximum Capability (MW)]) AS TotalMaxWindCapability
      FROM AESO_Generation
      WHERE Fuel='WIND'
      GROUP BY DateTime
      ORDER BY DateTime DESC;
    `,
    `
      SELECT TOP 100 DateTime, SUM([Maximum Capability (MW)]) AS TotalMaxWindCapability
      FROM AESO_Generation
      WHERE Fuel='BIOMASS AND OTHER'
      GROUP BY DateTime
      ORDER BY DateTime DESC;
    `,
    `
      SELECT TOP 100 DateTime, SUM([Maximum Capability (MW)]) AS TotalMaxWindCapability
      FROM AESO_Generation
      WHERE Fuel='GAS'
      GROUP BY DateTime
      ORDER BY DateTime DESC;
    `,
    `
      SELECT TOP 100 DateTime, SUM([Maximum Capability (MW)]) AS TotalMaxWindCapability
      FROM AESO_Generation
      WHERE Fuel='HYDRO'
      GROUP BY DateTime
      ORDER BY DateTime DESC;
    `,
    `
      SELECT TOP 100 DateTime, SUM([Maximum Capability (MW)]) AS TotalMaxWindCapability
      FROM AESO_Generation
      WHERE Fuel='COAL'
      GROUP BY DateTime
      ORDER BY DateTime DESC;
    `,
    `
      SELECT TOP 100 DateTime, SUM([Maximum Capability (MW)]) AS TotalMaxWindCapability
      FROM AESO_Generation
      WHERE Fuel='TOTAL'
      GROUP BY DateTime
      ORDER BY DateTime DESC;`,
  ],
  'ab-rt-generation': [
    `
        SELECT TOP 100 DateTime, SUM([Total Net Generation (MW)]) AS TotalMaxWindCapability
        FROM AESO_Generation
        WHERE Fuel='WIND'
        GROUP BY DateTime
        ORDER BY DateTime DESC;
    `,
    `
        SELECT TOP 100 DateTime, SUM([Total Net Generation (MW)]) AS TotalMaxWindCapability
        FROM AESO_Generation
        WHERE Fuel='BIOMASS AND OTHER'
        GROUP BY DateTime
        ORDER BY DateTime DESC;
    `,
    `
        SELECT TOP 100 DateTime, SUM([Total Net Generation (MW)]) AS TotalMaxWindCapability
        FROM AESO_Generation WHERE Fuel='GAS'
        GROUP BY DateTime
        ORDER BY DateTime DESC;
    `,
    `
        SELECT TOP 100 DateTime, SUM([Total Net Generation (MW)]) AS TotalMaxWindCapability
        FROM AESO_Generation
        WHERE Fuel='HYDRO'
        GROUP BY DateTime
        ORDER BY DateTime DESC;
    `,
    `
        SELECT TOP 100 DateTime, SUM([Total Net Generation (MW)]) AS TotalMaxWindCapability
        FROM AESO_Generation
        WHERE Fuel='COAL'
        GROUP BY DateTime
        ORDER BY DateTime DESC;`,
    `
        SELECT TOP 100 DateTime, SUM([Total Net Generation (MW)]) AS TotalMaxWindCapability
        FROM AESO_Generation
        WHERE Fuel='TOTAL'
        GROUP BY DateTime
        ORDER BY DateTime DESC;`,
  ],
};

const dataStore = Object.keys(queries)
  .reduce((obj, key) => ({
    ...obj,
    [key]: {
      lock: new Lock(),
      value: null,
      date: Date.now(),
    },
  }), {});

setInterval(() => {
  // eslint-disable-next-line no-restricted-syntax, guard-for-in
  for (const endPoint in dataStore) {
    const { value, date } = dataStore[endPoint];
    if (value && Date.now() - date >= process.env.DB_UPDATE_INTERVAL * 1000) {
      dataStore[endPoint].value = null;
    }
  }
}, process.env.DB_UPDATE_INTERVAL * 1000);

const getData = async (type) => {
  // Checking if the data is in cache
  let { value } = dataStore[type];
  if (!value) {
    // If the data is not in cache, obtaining "lock"
    const { lock } = dataStore[type];
    await lock.acquire();

    // Checking again if other competing request already populated the cache
    value = dataStore[type].value;

    if (!value) {
      // Populating the cache and returning the new value
      await sql.connect(config);
      const promises = queries[type].map((q) => sql.query(q));
      const results = await Promise.all(promises);
      value = results.map((result) => result.recordset);
      dataStore[type].value = value;
      dataStore[type].date = Date.now();
      lock.release();
    }
  }
  return value;
};

const apiController = async (req, res, next) => {
  try {
    if (!queries[req.params.type]) {
      next(new Error(`wrong parameter: ${req.params.type}`));
      return;
    }
    const result = await getData(req.params.type);
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

app.use(bodyParser.json());
app.get('/api/:type', (req, res, next) => apiController(req, res, next));
app.get('/', express.static(path.join(__dirname, 'public')));
app.use((err, req, res, next) => errorHandler(err, req, res, next));

const port = 8898;
// eslint-disable-next-line no-console
app.listen(port, () => console.log(`Listening on port ${port}...`));
