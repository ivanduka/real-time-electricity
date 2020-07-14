const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
// const sql = require('mssql/msnodesqlv8')

const app = express();
app.use(cors());
app.use("/", express.static("public"));

const config = {
  database: "EnergyData",
  server: "psql22cap",
  options: {
    trustedConnection: true
  }
};

const queries = {
  "sample": `SELECT TOP 30 * FROM AESO_ActualForecast ORDER BY DateTime DESC`,
}

const getData = async (type) => {
  return [1, 2, 3, type];
/
}

const tableIndex = async (req, res, next) => {
  try {
    await sql.connect(config)
    const result = await sql.query(query)
    return result
    res.json(result)
  } catch (error) {
    next(error);
  }
};

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    next(err);
    return;
  }
  res.statusMessage = err.message.replace(/[^\t\x20-\x7e\x80-\xff]/, "_");
  res.status(500).send();
}

app.use(bodyParser.json());
app.use("/manualHelper", (req, res, next) => tableIndex(req, res, next));
app.use("/", express.static(path.join(__dirname, "public")));
app.use((err, req, res, next) => errorHandler(err, req, res, next));

const port = 8897;
// eslint-disable-next-line no-console
app.listen(port, () => console.log(`Listening on port ${port}...`));
