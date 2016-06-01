import { expect } from 'chai';
import sinon from 'sinon';
import {
  TOGGLE_SELECTED, CHANGE_VIEW,
  toggleSelected, changeView, toggleSelectAll,
} from '~/linodes/actions';

describe('linodes/actions', () => {
  describe('changeView', () => {
    it('should return a CHANGE_VIEW action', () => {
      expect(changeView('grid'))
        .to.deep.equal({
          type: CHANGE_VIEW,
          view: 'grid',
        });
    });
  });

  describe('toggleSelected', () => {
    it('should return a TOGGLE_SELECTED action', () => {
      expect(toggleSelected('linode_1234'))
        .to.deep.equal({
          type: TOGGLE_SELECTED,
          selected: ['linode_1234'],
        });
    });
  });

  const linodesApiState = {
    api: {
      linodes: {
        linodes: {
          linode_1234: { },
          linode_1235: { },
          linode_1236: { },
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
        selected: ['linode_1234', 'linode_1235', 'linode_1236'],
      })).to.equal(true);
    });
  });
});
