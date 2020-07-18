const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const sql = require('mssql/msnodesqlv8');

const app = express();
app.use(cors());
app.use('/', express.static('public'));

const config = {
  database: 'EnergyData',
  server: 'psql22cap',
  options: {
    trustedConnection: true,
  },
};

const queries = {
  'ab-rt-fc-price': [
    'SELECT TOP 30 "DateTime", "Forecast Pool Price", "Actual Posted Pool Price" FROM AESO_ActualForecast ORDER BY DateTime DESC',
  ],
  'ab-rt-fc-demand': [
    'SELECT TOP 100 * FROM AESO_ActualForecast ORDER BY DateTime DESC',
  ],
  'ab-ht-price_hourly': [
    'SELECT TOP 100 * FROM AESO_PoolPrice ORDER BY DateTime DESC',
  ],
  'ab-rt-demand_supply': [
    'SELECT TOP 30 * FROM AESO_Summary WHERE Category=\'Alberta Internal Load (AIL)\' ORDER BY DateTime DESC',
    'SELECT TOP 30 * FROM AESO_Summary WHERE Category=\'Alberta Total Net Generation\' ORDER BY DateTime DESC',
  ],
  'ab-rt-interchange': [
    'SELECT TOP 30 * FROM AESO_Interchange WHERE Path=\'British Columbia\' ORDER BY DateTime DESC',
    'SELECT TOP 30 * FROM AESO_Interchange WHERE Path=\'Montana\' ORDER BY DateTime DESC',
    'SELECT TOP 30 * FROM AESO_Interchange WHERE Path=\'Saskatchewan\' ORDER BY DateTime DESC',
    'SELECT TOP 30 * FROM AESO_Interchange WHERE Path=\'TOTAL\' ORDER BY DateTime DESC',
  ],
  'ab-rt-capability': [
    'SELECT TOP 100 DateTime, SUM([Maximum Capability (MW)]) AS TotalMaxWindCapability FROM AESO_Generation WHERE Fuel=\'WIND\' GROUP BY DateTime ORDER BY DateTime DESC',
    'SELECT TOP 100 DateTime, SUM([Maximum Capability (MW)]) AS TotalMaxWindCapability FROM AESO_Generation WHERE Fuel=\'BIOMASS AND OTHER\' GROUP BY DateTime ORDER BY DateTime DESC',
    'SELECT TOP 100 DateTime, SUM([Maximum Capability (MW)]) AS TotalMaxWindCapability FROM AESO_Generation WHERE Fuel=\'GAS\' GROUP BY DateTime ORDER BY DateTime DESC',
    'SELECT TOP 100 DateTime, SUM([Maximum Capability (MW)]) AS TotalMaxWindCapability FROM AESO_Generation WHERE Fuel=\'HYDRO\' GROUP BY DateTime ORDER BY DateTime DESC',
    'SELECT TOP 100 DateTime, SUM([Maximum Capability (MW)]) AS TotalMaxWindCapability FROM AESO_Generation WHERE Fuel=\'COAL\' GROUP BY DateTime ORDER BY DateTime DESC',
    'SELECT TOP 100 DateTime, SUM([Maximum Capability (MW)]) AS TotalMaxWindCapability FROM AESO_Generation WHERE Fuel=\'TOTAL\' GROUP BY DateTime ORDER BY DateTime DESC',
  ],
  'ab-rt-generation': [
    'SELECT TOP 100 DateTime, SUM([Total Net Generation (MW)]) AS TotalMaxWindCapability FROM AESO_Generation WHERE Fuel=\'WIND\' GROUP BY DateTime ORDER BY DateTime DESC',
    'SELECT TOP 100 DateTime, SUM([Total Net Generation (MW)]) AS TotalMaxWindCapability FROM AESO_Generation WHERE Fuel=\'BIOMASS AND OTHER\' GROUP BY DateTime ORDER BY DateTime DESC',
    'SELECT TOP 100 DateTime, SUM([Total Net Generation (MW)]) AS TotalMaxWindCapability FROM AESO_Generation WHERE Fuel=\'GAS\' GROUP BY DateTime ORDER BY DateTime DESC',
    'SELECT TOP 100 DateTime, SUM([Total Net Generation (MW)]) AS TotalMaxWindCapability FROM AESO_Generation WHERE Fuel=\'HYDRO\' GROUP BY DateTime ORDER BY DateTime DESC',
    'SELECT TOP 100 DateTime, SUM([Total Net Generation (MW)]) AS TotalMaxWindCapability FROM AESO_Generation WHERE Fuel=\'COAL\' GROUP BY DateTime ORDER BY DateTime DESC',
    'SELECT TOP 100 DateTime, SUM([Total Net Generation (MW)]) AS TotalMaxWindCapability FROM AESO_Generation WHERE Fuel=\'TOTAL\' GROUP BY DateTime ORDER BY DateTime DESC',
  ],
};

const getData = async (type) => {
  await sql.connect(config);
  const promises = queries[type].map((q) => sql.query(q));
  const results = await Promise.all(promises);
  return results.map((result) => result.recordset);
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
app.use('/api/:type', (req, res, next) => apiController(req, res, next));
app.use('/', express.static(path.join(__dirname, 'public')));
app.use((err, req, res, next) => errorHandler(err, req, res, next));

const port = 8897;
// eslint-disable-next-line no-console
app.listen(port, () => console.log(`Listening on port ${port}...`));
