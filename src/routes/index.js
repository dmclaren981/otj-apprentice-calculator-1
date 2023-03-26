const express = require('express');
const { getDashboard } = require('../controller/dashboard');
const { getAllUsers, getUserById, addUser } = require('../controller/users');
const { authLogin } = require('../controller/login');
const { getRegister, registerUser } = require('../controller/register');
const { getUserDashboard } = require('../controller/user-dashboard');
const { getAdminDashboard } = require('../controller/admin-dashboard');
const { addHours } = require('../controller/hours/add-hours');
const { viewEditHoursHistory, getEditHoursForm, updateHours } = require('../controller/hours/otj-hours');
const { deleteHours } = require('../controller/hours/delete-hours');
const { getAdminApprenticesPage } = require('../controller/admin-apprentices');
const { generateAdminCodes } = require('../controller/admin-dashboard');

const getRoutes = () => {
  const app = express.Router();
  app.get('/', (req, res) => {
    res.redirect('/dashboard');
  });
  app.get('/login', (req, res) => {
    res.redirect('/dashboard');
  });
  app.get('/dashboard', getDashboard);
  app.get('/users', getAllUsers); // we shouldn't expose our users route for security purposes
  app.get('/users/:id', getUserById); // amend to be get user by name?
  app.get('/register', getRegister);
  app.get('/user/dashboard', getUserDashboard);
  app.get('/hours-history', viewEditHoursHistory);
  app.get('/edit-hours-form/:id', getEditHoursForm);
  app.get('/admin/dashboard', getAdminDashboard);
  app.get('/admin/apprentice/info', getAdminApprenticesPage);
  app.post('/admin/generate-codes', generateAdminCodes);
  app.post('/register', registerUser);
  app.post('/users/', addUser);
  app.post('/login', authLogin);
  app.post('/add-hours', addHours);
  app.post('/edit-hours/:id', updateHours);
  app.post('/delete-hours/:id', deleteHours);
  return app;
};

module.exports = {
  getRoutes,
};
