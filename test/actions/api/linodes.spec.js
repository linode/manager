import sinon from 'sinon';
import { expect } from 'chai';
import {
  powerOnLinode,
  powerOffLinode,
  rebootLinode,
  UPDATE_LINODE,
} from '../../../src/actions/api/linodes';
import { mock_context } from '../../mocks';

describe('actions/linodes/power', sinon.test(() => {
  const mock_booting_response = {
    type: UPDATE_LINODE,
    linode: { id: 'foo', state: 'booting' },
  };

  let sandbox = null;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('returns linode power boot status', async () => {
    await mock_context(sandbox, async ({
        auth, dispatch, getState, fetchStub,
      }) => {
      const f = powerOnLinode('foo');

      await f(dispatch, getState);

      expect(fetchStub.calledWith(
        auth.token, '/linodes/foo/boot', { method: 'POST' })).to.be.true;
      expect(dispatch.calledWith({
        type: UPDATE_LINODE,
        linode: { id: 'foo', state: 'booting' },
      })).to.be.true;
    }, mock_booting_response);
  });

  const mock_shutting_down_response = {
    ...mock_booting_response,
    linode: { ...mock_booting_response.linode, state: 'shutting_down' },
  };

  it('returns linode power shutdown status', async () => {
    await mock_context(sandbox, async ({
        auth, dispatch, getState, fetchStub,
      }) => {
      const f = powerOffLinode('foo');

      await f(dispatch, getState);

      expect(fetchStub.calledWith(
        auth.token, '/linodes/foo/shutdown', { method: 'POST' })).to.be.true;
      expect(dispatch.calledWith({
        type: UPDATE_LINODE,
        linode: { id: 'foo', state: 'shutting_down' },
      })).to.be.true;
    }, mock_shutting_down_response);
  });

  const mock_rebooting_response = {
    ...mock_booting_response,
    linode: { ...mock_booting_response.linode, state: 'rebooting' },
  };

  it('returns linode power reboot status', async () => {
    await mock_context(sandbox, async ({
        auth, dispatch, getState, fetchStub,
      }) => {
      const f = rebootLinode('foo');

      await f(dispatch, getState);

      expect(fetchStub.calledWith(
        auth.token, '/linodes/foo/reboot', { method: 'POST' })).to.be.true;
      expect(dispatch.calledWith({
        type: UPDATE_LINODE,
        linode: { id: 'foo', state: 'rebooting' },
      })).to.be.true;
    }, mock_rebooting_response);
  });
}));
