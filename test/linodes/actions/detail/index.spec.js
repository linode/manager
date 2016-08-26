import sinon from 'sinon';
import { expect } from 'chai';
import * as actions from '~/linodes/actions/detail/index';
import { UPDATE_LINODE } from '~/actions/api/linodes';
import * as fetch from '~/fetch';
import { state } from '@/data';
import { expectRequest } from '@/common';

describe('linodes/actions/detail/index', () => {
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

    it('should return a function', () => {
      const action = actions.commitChanges('linode_1234');
      expect(action).to.be.a('function');
    });

    it('toggles the loading state twice', async () => {
      const action = actions.commitChanges('linode_1234');
      expect(action).to.be.a('function');
      const dispatch = sandbox.spy();
      const getState = sandbox.stub().returns(state);
      sandbox.stub(fetch, 'fetch').returns({ json: () => {} });
      await action(dispatch, getState);
      expect(dispatch.withArgs({ type: actions.TOGGLE_LOADING }).calledTwice)
        .to.equal(true);
    });

    it('performs the HTTP request', async () => {
      const fn = actions.commitChanges('linode_1234');
      expectRequest(fn, '/linodes/linode_1234', () => {}, null,
        o => expect(o).to.deep.equal({
          method: 'PUT',
          body: JSON.stringify({
            label: 'new label',
            group: 'new group',
          }),
        }));
    });

    it('handles non-400 errors', async () => {
      const action = actions.commitChanges('linode_1234');
      expect(action).to.be.a('function');
      const dispatch = sandbox.spy();
      const getState = sandbox.stub().returns(state);
      sandbox.stub(fetch, 'fetch')
        .throws({
          json: () => ({}),
          statusCode: 401,
          statusText: 'Unauthorized',
        });
      await action(dispatch, getState);
      expect(dispatch.calledWith({
        type: actions.SET_ERRORS,
        _: ['Error: 401 Unauthorized'],
      })).to.equal(true);
    });

    it('handles 400 errors', async () => {
      const action = actions.commitChanges('linode_1234');
      expect(action).to.be.a('function');
      const dispatch = sandbox.spy();
      const getState = sandbox.stub().returns(state);
      sandbox.stub(fetch, 'fetch')
        .throws({
          json: () => ({
            errors: [
              {
                field: 'label',
                reason: 'This is a silly name for a Linode',
              },
            ],
          }),
          statusCode: 400,
          statusText: 'Bad Request',
        });
      await action(dispatch, getState);
      expect(dispatch.calledWith({
        type: actions.SET_ERRORS,
        label: ['This is a silly name for a Linode'],
        group: null,
        _: null,
      })).to.equal(true);
    });

    it('dispatches an UPDATE_LINODE action with the new linode details', async () => {
      const fn = actions.commitChanges('linode_1234');
      expect(fn, '/linodes/linode_1234',
        d => expect(d.args[0]).to.deep.equal({
          type: UPDATE_LINODE,
          linode: { fake: 'linode' },
        }));
    });

    it('leaves edit mode', async () => {
      const action = actions.commitChanges('linode_1234');
      expect(action).to.be.a('function');
      const dispatch = sandbox.spy();
      const getState = sandbox.stub().returns(state);
      sandbox.stub(fetch, 'fetch').returns({ json: () => {} });
      await action(dispatch, getState);
      expect(dispatch.withArgs({ type: actions.TOGGLE_EDIT_MODE }).calledOnce).to.equal(true);
    });
  });
});
