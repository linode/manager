import sinon from 'sinon';
import { expect } from 'chai';
import * as actions from '~/linodes/actions/detail/index';
import { UPDATE_LINODE } from '~/actions/api/linodes';
import * as fetch from '~/fetch';

describe('linodes/actions/detail', () => {
  describe('toggleEditMode', () => {
    it('should return a TOGGLE_EDIT_MODE action', () => {
      expect(actions.toggleEditMode())
        .to.deep.equal({
          type: actions.TOGGLE_EDIT_MODE,
        });
    });
  });

  describe('setLinodeLabel', () => {
    it('should return a SET_LINODE_LABEL action', () => {
      expect(actions.setLinodeLabel('asdf'))
        .to.deep.equal({
          type: actions.SET_LINODE_LABEL,
          label: 'asdf',
        });
    });
  });

  describe('setLinodeGroup', () => {
    it('should return a SET_LINODE_GROUP action', () => {
      expect(actions.setLinodeGroup('asdf'))
        .to.deep.equal({
          type: actions.SET_LINODE_GROUP,
          group: 'asdf',
        });
    });
  });

  describe('commitChanges', () => {
    const sandbox = sinon.sandbox.create();

    afterEach(() => {
      sandbox.restore();
    });

    const state = {
      authentication: {
        token: 'token',
      },
      linodes: {
        detail: {
          index: {
            label: 'new label',
            group: 'new group',
          },
        },
      },
    };
    const getGetState = (_state = {}) => sandbox.stub().returns(_state);
    const getDispatch = () => sandbox.spy();
    const getFetchStub = (rsp) => sandbox.stub(fetch, 'fetch').returns({ json() { return rsp; } });

    it('should return a function', () => {
      const action = actions.commitChanges('linode_1234');
      expect(action).to.be.a('function');
    });

    it('toggles the loading state twice', async () => {
      const action = actions.commitChanges('linode_1234');
      expect(action).to.be.a('function');
      const dispatch = getDispatch();
      const getState = getGetState(state);
      getFetchStub();
      await action(dispatch, getState);
      expect(dispatch.withArgs({ type: actions.TOGGLE_LOADING }).calledTwice)
        .to.equal(true);
    });

    it('performs the HTTP request', async () => {
      const action = actions.commitChanges('linode_1234');
      expect(action).to.be.a('function');
      const dispatch = getDispatch();
      const getState = getGetState(state);
      const fetchStub = getFetchStub();
      await action(dispatch, getState);
      expect(fetchStub.calledOnce).to.equal(true);
      expect(fetchStub.calledWith(
        state.authentication.token,
        '/linodes/linode_1234', {
          method: 'PUT',
          body: JSON.stringify({
            label: 'new label',
            group: 'new group',
          }),
        })).to.equal(true);
    });

    it('dispatches an UPDATE_LINODE action with the new linode details', async () => {
      const action = actions.commitChanges('linode_1234');
      expect(action).to.be.a('function');
      const dispatch = getDispatch();
      const getState = getGetState(state);
      getFetchStub({ fake: 'linode' });
      await action(dispatch, getState);
      expect(dispatch.withArgs({
        type: UPDATE_LINODE,
        linode: { fake: 'linode' },
      }).calledOnce).to.equal(true);
    });

    it('leaves edit mode', async () => {
      const action = actions.commitChanges('linode_1234');
      expect(action).to.be.a('function');
      const dispatch = getDispatch();
      const getState = getGetState(state);
      getFetchStub();
      await action(dispatch, getState);
      expect(dispatch.withArgs({ type: actions.TOGGLE_EDIT_MODE }).calledOnce).to.equal(true);
    });
  });
});
