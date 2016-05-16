import sinon from 'sinon';
import { expect } from 'chai';
import * as fetch from '~/fetch';
import {
  powerOnLinode,
  powerOffLinode,
  rebootLinode
} from '../../../src/actions/api/linodes';
import * as linode_actions from '../../../src/actions/api/linodes';

const mock_context = async (f, rsp, state={}) => {
  const auth = { token: 'token' };
  let getState = sinon.stub().returns({
    authentication: auth,
    ...state
  });
  let dispatch = sinon.spy();
  let fetchStub = sinon.stub(fetch, "fetch").returns({
    json: () => rsp
  });
  await f({auth, getState, dispatch, fetchStub});
  fetchStub.restore();
};

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
