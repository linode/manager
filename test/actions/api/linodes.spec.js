import sinon from 'sinon';
import {
  powerOnLinode,
  powerOffLinode,
  rebootLinode,
  UPDATE_LINODE
} from '../../../src/actions/api/linodes';
import { mock_context } from '../../mocks';

describe("actions/linodes/power", sinon.test(() => {
  const mock_booting_response = {
    type: UPDATE_LINODE,
    linode: { id: "foo", state: "booting" }
  };

  it('returns linode power boot status', async () => {
    await mock_context(async ({
        auth, dispatch, getState, fetchStub
      }) => {
      const f = powerOnLinode("foo");

      await f(dispatch, getState);

      sinon.assert.calledWith(fetchStub,
        auth.token, '/linodes/foo/boot', { method: "POST" });
      sinon.assert.calledWith(dispatch, {
        type: UPDATE_LINODE,
        linode: { id: "foo", state: "booting" }
      });
    }, mock_response);
  });

  const mock_shutting_down_response = {
    ...mock_booting_response,
    linode: { ...mock_booting_response.linode, state: "shutting_down" }
  };

  it('returns linode power shutdown status', async () => {
    await mock_context(async ({
        auth, dispatch, getState, fetchStub
      }) => {
      const f = powerOffLinode("foo");

      await f(dispatch, getState);

      sinon.assert.calledWith(fetchStub,
        auth.token, '/linodes/foo/shutdown', { method: "POST" });
      sinon.assert.calledWith(dispatch, {
        type: UPDATE_LINODE,
        linode: { id: "foo", state: "shutting_down" }
      });
    }, mock_shutting_down_response);
  });

  const mock_rebooting_response = {
    ...mock_booting_response,
    linode: { ...mock_booting_response.linode, state: "rebooting" }
  };

  it('returns linode power reboot status', async () => {
    await mock_context(async ({
        auth, dispatch, getState, fetchStub
      }) => {
      const f = rebootLinode("foo");

      await f(dispatch, getState);

      sinon.assert.calledWith(fetchStub,
        auth.token, '/linodes/foo/reboot', { method: "POST" });
      sinon.assert.calledWith(dispatch, {
        type: UPDATE_LINODE,
        linode: { id: "foo", state: "rebooting" }
      });
    }, mock_rebooting_response);
  });
}));
