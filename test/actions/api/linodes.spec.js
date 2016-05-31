import sinon from 'sinon';
import { expect } from 'chai';
import {
  powerOnLinode,
  powerOffLinode,
  rebootLinode,
  UPDATE_LINODE,
} from '../../../src/actions/api/linodes';
import { mockFetchContext } from '../../contexts';

describe('actions/linodes/power', sinon.test(() => {
  const mockBootingResponse = {
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
    await mockFetchContext(sandbox, async ({
        auth, dispatch, getState, fetchStub,
      }) => {
      const f = powerOnLinode('foo');

      await f(dispatch, getState);

      expect(fetchStub.calledWith(
        auth.token, '/linodes/foo/boot', { method: 'POST' })).to.equal(true);
      expect(dispatch.calledWith({
        type: UPDATE_LINODE,
        linode: { id: 'foo', state: 'booting' },
      })).to.equal(true);
    }, mockBootingResponse);
  });

  const mockShuttingDownResponse = {
    ...mockBootingResponse,
    linode: { ...mockBootingResponse.linode, state: 'shutting_down' },
  };

  it('returns linode power shutdown status', async () => {
    await mockFetchContext(sandbox, async ({
        auth, dispatch, getState, fetchStub,
      }) => {
      const f = powerOffLinode('foo');

      await f(dispatch, getState);

      expect(fetchStub.calledWith(
        auth.token, '/linodes/foo/shutdown', { method: 'POST' })).to.equal(true);
      expect(dispatch.calledWith({
        type: UPDATE_LINODE,
        linode: { id: 'foo', state: 'shutting_down' },
      })).to.equal(true);
    }, mockShuttingDownResponse);
  });

  const mockRebootingResponse = {
    ...mockBootingResponse,
    linode: { ...mockBootingResponse.linode, state: 'rebooting' },
  };

  it('returns linode power reboot status', async () => {
    await mockFetchContext(sandbox, async ({
        auth, dispatch, getState, fetchStub,
      }) => {
      const f = rebootLinode('foo');

      await f(dispatch, getState);

      expect(fetchStub.calledWith(
        auth.token, '/linodes/foo/reboot', { method: 'POST' })).to.equal(true);
      expect(dispatch.calledWith({
        type: UPDATE_LINODE,
        linode: { id: 'foo', state: 'rebooting' },
      })).to.equal(true);
    }, mockRebootingResponse);
  });
}));
