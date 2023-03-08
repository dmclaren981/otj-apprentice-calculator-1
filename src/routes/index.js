const express = require('express');
const { getHome } = require('../controller/dashboard');
const { getAllUsers, getUserById, addUser } = require('../controller/users');

const getRoutes = () => {
  const app = express.Router();
  app.get('/', (req, res) => {
    res.send('hey girl');
  })
  app.get('/dashboard', getHome);
  app.get('/users', getAllUsers); // we shouldn't expose our users route for security purposes
  app.get('/users/:id', getUserById); // amend to be get user by name?
  app.post('/users/', addUser);

  return app;
};

module.exports = {
  getRoutes,
};
