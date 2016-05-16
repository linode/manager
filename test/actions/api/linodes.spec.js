import sinon from 'sinon';
import { expect } from 'chai';
import * as fetch from '~/fetch';
import {
  powerOnLinode,
  powerOffLinode,
  rebootLinode
} from '../../../src/actions/api/linodes';
import * as linode_actions from '../../../src/actions/api/linodes';
import { mock_context } from '../../api-store.spec.js';

describe("actions/linodes/power", sinon.test(() => {
  it('returns linode power boot status', async () => {
    await mock_context(async ({
        auth, dispatch, getState, fetchStub
      }) => {
      const f = powerOnLinode("foo");

      await f(dispatch, getState);

      sinon.assert.calledWith(fetchStub,
        auth.token, '/linodes/foo/boot', { method: "POST" });
      sinon.assert.calledWith(dispatch, {
        type: linode_actions.UPDATE_LINODE,
        linode: { id: "foo", state: "booting" }
      });
    }, {
      type: linode_actions.UPDATE_LINODE,
      linode: { id: "foo", state: "booting" }
    });
  });

  it('returns linode power shutdown status', async () => {
    await mock_context(async ({
        auth, dispatch, getState, fetchStub
      }) => {
      const f = powerOffLinode("foo");

      await f(dispatch, getState);

      sinon.assert.calledWith(fetchStub,
        auth.token, '/linodes/foo/shutdown', { method: "POST" });
      sinon.assert.calledWith(dispatch, {
        type: linode_actions.UPDATE_LINODE,
        linode: { id: "foo", state: "shutting_down" }
      });
    }, {
      type: linode_actions.UPDATE_LINODE,
      linode: { id: "foo", state: "shutting_down" }
    });
  });

  it('returns linode power reboot status', async () => {
    await mock_context(async ({
        auth, dispatch, getState, fetchStub
      }) => {
      const f = rebootLinode("foo");

      await f(dispatch, getState);

      sinon.assert.calledWith(fetchStub,
        auth.token, '/linodes/foo/reboot', { method: "POST" });
      sinon.assert.calledWith(dispatch, {
        type: linode_actions.UPDATE_LINODE,
        linode: { id: "foo", state: "rebooting" }
      });
    }, {
      type: linode_actions.UPDATE_LINODE,
      linode: { id: "foo", state: "rebooting" }
    });
  });
}));
