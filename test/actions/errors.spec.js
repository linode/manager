import sinon from 'sinon';
import { expect } from 'chai';
import * as actions from '../../src/actions/errors';

describe('actions/errors', () => {
  describe('toggleDetails', () => {
    it('should return a TOGGLE_DETAILS action', () => {
      expect(actions.toggleDetails())
        .to.deep.equal({ type: actions.TOGGLE_DETAILS });
    });
  });

  describe('setError', () => {
    const sandbox = sinon.sandbox.create();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return a thunk', () => {
      expect(actions.setError({})).to.be.a('function');
    });

    it('retrieve the body for JSON responses', async () => {
      const json = sandbox.stub();
      json.returns({ foo: 'bar' });
      const response = {
        headers: {
          get: () => 'application/json',
        },
        json,
      };
      const thunk = actions.setError(response);
      await thunk(() => {});
      expect(json.calledOnce).to.equal(true);
    });

    it('dispatches a SET_ERROR action', async () => {
      const response = {
        headers: {
          get: () => 'application/json',
        },
        json: () => ({ foo: 'bar' }),
        statusCode: 400,
        statusText: 'Bad Request',
      };
      const thunk = actions.setError(response);
      const dispatch = sandbox.spy();
      await thunk(dispatch);
      expect(dispatch.calledOnce).to.equal(true);
      expect(dispatch.calledWith({
        type: actions.SET_ERROR,
        status: 400,
        statusText: 'Bad Request',
        json: { foo: 'bar' },
      })).to.equal(true);
    });
  });
});
