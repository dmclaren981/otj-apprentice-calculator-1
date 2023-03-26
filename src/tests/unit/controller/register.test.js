/* eslint-disable no-unused-expressions */
/* eslint-disable  no-underscore-dangle */
const rewire = require('rewire');
const chai = require('chai');
const sinon = require('sinon');
const { describe } = require('mocha');

const { expect } = chai;

describe('getRegister', () => {
  const register = rewire('../../../controller/register');

  it('should render the register template with error message if there is one', async () => {
    const req = { flash: () => 'There was an error' };
    const res = {
      render: (view, options) => {
        expect(view).to.equal('register');
        expect(options.error).to.equal('There was an error');
      },
    };
    await getRegister(req, res);
  });

  it('should render the register template without an error message if there is none', async () => {
    const req = { flash: () => null };
    const res = {
      render: (view, options) => {
        expect(view).to.equal('register');
        expect(options.error).to.be.undefined;
      },
    };
    await getRegister(req, res);
  });

  it('should log an error message and "its broken" if there is an error', async () => {
    const req = {
      flash: () => {
        throw new Error('Oops!');
      },
    };
    const res = {
      render: () => {
        throw new Error('Should not be called');
      },
    };
    const consoleSpy = sinon.spy(console, 'log');
    await getRegister(req, res);
    expect(consoleSpy).to.have.been.calledWith('Oops!');
    expect(consoleSpy).to.have.been.calledWith('its broken');
    consoleSpy.restore();
  });
});
