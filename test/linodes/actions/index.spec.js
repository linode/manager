import { expect } from 'chai';
import sinon from 'sinon';
import { TOGGLE_SELECTED, toggleSelected, toggleSelectAll } from '~/linodes/actions';

describe('linodes/actions', () => {
  describe('toggleSelected', () => {
    it('should return a TOGGLE_SELECTED action', () => {
      expect(toggleSelected('1234'))
        .to.deep.equal({
          type: TOGGLE_SELECTED,
          selected: ['1234'],
        });
    });
  });

  const linodesApiState = {
    api: {
      linodes: {
        linodes: {
          1234: { },
          1235: { },
          1236: { },
        },
      },
    },
  };

  describe('toggleSelectAll', () => {
    const sandbox = sinon.sandbox.create();

    afterEach(() => {
      sandbox.restore();
    });

    it('returns a function', () => {
      const func = toggleSelectAll();
      expect(func).to.be.a('function');
    });

    it('should call getState() once', () => {
      const getState = sandbox.stub().returns(linodesApiState);
      const dispatch = sandbox.spy();
      const func = toggleSelectAll();
      func(dispatch, getState);
      expect(getState.calledOnce).to.equal(true);
    });

    it('should call dispatch({ action }) once', () => {
      const getState = sandbox.stub().returns(linodesApiState);
      const dispatch = sandbox.spy();
      const func = toggleSelectAll();
      func(dispatch, getState);
      expect(dispatch.calledWith({
        type: TOGGLE_SELECTED,
        selected: ['1234', '1235', '1236'],
      })).to.equal(true);
    });
  });
});
