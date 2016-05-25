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

  const linodes_api_state = {
    api: {
      linodes: {
        linodes: {
          'linode_1234': { },
          'linode_1235': { },
          'linode_1236': { },
        },
      },
    },
  };

  describe('toggleSelectAll', () => {
    it('returns a function', () => {
      const func = toggleSelectAll();
      expect(func).to.be.a('function');
    });

    it('should call getState() once', () => {
      const getState = sinon.stub().returns(linodes_api_state);
      const dispatch = sinon.spy();
      const func = toggleSelectAll();
      func(dispatch, getState);
      expect(getState.calledOnce).to.be.true;
    });

    it('should call dispatch({ action }) once', () => {
      const getState = sinon.stub().returns(linodes_api_state);
      const dispatch = sinon.spy();
      const func = toggleSelectAll();
      func(dispatch, getState);
      expect(dispatch.calledWith({
        type: TOGGLE_SELECTED,
        selected: ['linode_1234', 'linode_1235', 'linode_1236'],
      })).to.be.true;
    });
  });
});
