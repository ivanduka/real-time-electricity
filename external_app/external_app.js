const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
require('dotenv')
  .config();
const got = require('got');

const apiLimiter = rateLimit({
  windowMs: process.env.RATE_LIMITING_WINDOW_IN_SECONDS * 1000, // in milliseconds
  max: process.env.RATE_LIMITING_LIMIT_PER_WINDOW, // requests per windowMs
});

const apiController = async (req, res, next) => {
  try {
    const { type } = req.params;
    const result = await got.post(`${process.env.INTERNAL_SERVER_URL}/api/${type}`,
      { responseType: 'json' });
    res.json(result.body);
  } catch (error) {
    next(error);
  }
};

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    next(err);
    return;
  }
  res.status(500)
    .send();
  // eslint-disable-next-line no-console
  console.log(err);
}

const app = express();
app.disable('etag');
app.use(cors());
app.get('/api/', (req, res, next) => apiLimiter(req, res, next));
app.use(bodyParser.json());
app.get('/api/:type', (req, res, next) => apiController(req, res, next));
app.use((err, req, res, next) => errorHandler(err, req, res, next));

// eslint-disable-next-line no-console
app.listen(process.env.PORT, () => console.log(`Listening on port ${process.env.PORT}...`));
