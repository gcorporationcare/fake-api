// External dependencies
const FileSync = require('lowdb/adapters/FileSync');
const swaggerUI = require('swagger-ui-express');
const express = require('express');
const low = require('lowdb');
const { join } = require('path');
const morgan = require('morgan');
const cors = require('cors');

// Local dependencies
const docs = require('./docs');
const utils = require('./core/utils');
const routes = require('./core/routes');
const auth = require('./core/auth');

// 1- Generate a pseudo-database by synching with JSON file
const adapter = new FileSync(join(__dirname, 'data', 'db.json'));
const db = low(adapter);

// 2- Prepare express app by adding global values
const app = express();
app.disable('x-powered-by');
app.db = db;
utils.resetDatabase(app);

// Enable CORS for request verbs, and also enabling logger
app.use(morgan('combined'));
const corsOptions = {
  origin: 'localhost',
};
app.use(cors(corsOptions));
app.use(
  express.urlencoded({
    extended: true,
  })
);

// Enabling JSON
app.use(express.json());

// 3- Adding models endpoints to application
Object.keys(routes.endpoints).forEach((route) =>
  app.use(`/${route}`, routes.endpoints[route])
);
app.use('/auth', auth.router);

// 4- Adding Swagger and other useful endpoints
const swaggerDocs = docs.generate(app.rawDatabase);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));
app.get('/swagger.json', (req, res) => {
  res.json(swaggerDocs);
});
app.get('/reset', (req, res) => {
  utils.resetDatabase(req.app);
  res.json({ now: new Date() });
});

// 5- Adding global errors handler
app.use(utils.errorHandler);

// 6- Starting the application.
const PORT = process.env.PORT || 3000;
const initialize = async () => {
  app.listen(PORT);
};

initialize().finally(() =>
  console.log(`Server running at http://localhost:${PORT}/`)
);
