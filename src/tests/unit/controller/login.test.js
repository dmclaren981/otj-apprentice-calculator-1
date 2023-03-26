// authController.test.js
const { expect } = require('chai');
const sinon = require('sinon');
const bcrypt = require('bcrypt');
const pool = require('../../db');
const authController = require('./authController');

describe('authController', () => {
  describe('authLogin', () => {
    it('should redirect to /dashboard with error message when query execution fails', () => {
      const req = {
        body: {
          username: 'testuser',
          password: 'testpassword',
        },
        flash: sinon.stub(),
      };
      const res = {
        redirect: sinon.stub(),
      };
      const error = new Error('Query execution failed');
      const queryStub = sinon.stub(pool, 'query').callsFake((text, params, callback) => {
        callback(error);
      });

      authController.authLogin(req, res);

      expect(queryStub.calledOnce).to.be.true;
      expect(req.flash.calledOnceWith('error', error.message)).to.be.true;
      expect(res.redirect.calledOnceWith('/dashboard')).to.be.true;

      queryStub.restore();
    });

    it('should redirect to /dashboard with error message when no user found', () => {
      const req = {
        body: {
          username: 'nonexistentuser',
          password: 'testpassword',
        },
        flash: sinon.stub(),
      };
      const res = {
        redirect: sinon.stub(),
      };
      const queryResult = {
        rows: [],
      };
      const queryStub = sinon.stub(pool, 'query').callsFake((text, params, callback) => {
        callback(null, queryResult);
      });

      authController.authLogin(req, res);

      expect(queryStub.calledOnce).to.be.true;
      expect(req.flash.calledOnceWith('error', 'Invalid username or password')).to.be.true;
      expect(res.redirect.calledOnceWith('/dashboard')).to.be.true;

      queryStub.restore();
    });

    it('should redirect to /dashboard with error message when password is invalid', () => {
      const req = {
        body: {
          username: 'testuser',
          password: 'wrongpassword',
        },
        flash: sinon.stub(),
      };
      const res = {
        redirect: sinon.stub(),
      };
      const queryResult = {
        rows: [
          {
            id: 1,
            username: 'testuser',
            email: 'testuser@example.com',
            password: '$2b$10$z75H0ldqY3tjPJKdfInka.xt0R1tLbhD50sBjO8ZpNCrsOeH/SMC2',
            role: 'user',
          },
        ],
      };
      const compareStub = sinon.stub(bcrypt, 'compare').callsFake((password, hash, callback) => {
        callback(null, false);
      });
      const queryStub = sinon.stub(pool, 'query').callsFake((text, params, callback) => {
        callback(null, queryResult);
      });

      authController.authLogin(req, res);

      expect(queryStub.calledOnce).to.be.true;
      expect(compareStub.calledOnce).to.be.true;
      expect(req.flash.calledOnceWith('error', 'Invalid username or password')).to.be.true;
      expect(res.redirect.calledOnceWith('/dashboard')).to.be.true;

      compareStub.restore();
      queryStub.restore();
    });
  });
});
// it('should redirect to /admin/dashboard with success message when user is admin', () => {
//   const req = {
//     body: {
//       username: 'adminuser',
