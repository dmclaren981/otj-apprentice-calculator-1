const session = require('express-session');
const flash = require('express-flash');

const flashMiddleware = (req, res, next) => {
  res.locals.sessionFlash = req.session.sessionFlash;
  delete req.session.sessionFlash;
  next();
};

module.exports = (app) => {
  app.use(session({
    cookie: { maxAge: 60000 },
    saveUninitialized: true,
    resave: 'true',
    secret: 'no',
  }));
  app.use(flash());
  app.use(flashMiddleware);
};
