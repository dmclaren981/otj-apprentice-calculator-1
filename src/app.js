/* eslint-disable newline-per-chained-call, brace-style */
const express = require('express');
const app = express();
const http = require('http');
const port = 3005;
const bodyParser = require('body-parser');

const { getRoutes } = require('./routes');

module.exports = () => {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use('/', getRoutes());

  app.use(express.json());
  
  let server = null;
  
  // app.set('view engine', 'ejs');
  // app.set('view engine', 'html');
  app.use('/assets', express.static('assets'));

  server = http.createServer(app); 

  server.on('listening', () => console.log(`Listening on port ${port}`));
  server.listen(port);
};

