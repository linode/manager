import sinon from 'sinon';
import { expect } from 'chai';
import * as actions from '~/actions/errors';

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

    it('dispatches a SET_ERROR action', async () => {
      const thunk = actions.setError({ status: 404 });
      const dispatch = sandbox.spy();
      await thunk(dispatch);
      expect(dispatch.callCount).to.equal(1);
      expect(dispatch.calledWith({
        type: actions.SET_ERROR,
        status: 404,
      })).to.equal(true);
    });
  });
});
