/* eslint-disable newline-per-chained-call, brace-style */
const express = require('express');
const session = require('express-session');

const app = express();
const http = require('http');

const port = 3005;
const bodyParser = require('body-parser');
const flashConfig = require('./flash-config');
const { nunjucksConfig } = require('./nunjucks-config');
const { createTables } = require('./controller/create-table');

const { getRoutes } = require('./routes');

module.exports = () => {
  // Create the table when the application starts up
  createTables();

  // configure session middleware
  app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
  }));

  nunjucksConfig(app);
  flashConfig(app);
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use('/', getRoutes());

  app.use(express.json());

  let server = null;
  app.use('/assets', express.static('assets'));

  server = http.createServer(app);

  server.on('listening', () => console.log(`Listening on port ${port}`));
  server.listen(port);
};
