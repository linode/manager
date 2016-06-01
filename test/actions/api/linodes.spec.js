import sinon from 'sinon';
import { expect } from 'chai';
import {
  powerOnLinode,
  powerOffLinode,
  rebootLinode,
  UPDATE_LINODE,
  UPDATE_LINODES,
  DELETE_LINODE,
  fetchLinodes,
  updateLinode,
  updateLinodeUntil,
  deleteLinode
} from '../../../src/actions/api/linodes';
import { mockFetchContext } from '../../contexts';

describe('actions/api/linodes', sinon.test(() => {
  let sandbox = null;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  const mockFetchResponse = 'foobar';

  it('should fetch linodes', async () => {
    await mockContext(sandbox, async ({
        auth, dispatch, getState, fetchStub
      }) => {
      const f = fetchLinodes();

      await f(dispatch, getState);

      expect(fetchStub.calledWith(
        auth.token, '/linodes?page=1')).to.be.true;
      expect(dispatch.calledWith({
        type: UPDATE_LINODES,
        response: mockFetchResponse
      })).to.be.true;
    }, mockFetchResponse);
  });

  const mockUpdateLinode = { id: 'linode_1' };

  it('should update linode', async () => {
    await mockContext(sandbox, async ({
        auth, dispatch, getState, fetchStub
      }) => {
      const f = updateLinode('linode_1');

      await f(dispatch, getState);

      expect(fetchStub.calledWith(
        auth.token, '/linodes/linode_1')).to.be.true;
      expect(dispatch.calledWith({
        type: UPDATE_LINODE,
        linode: mockUpdateLinode
      })).to.be.true;
    }, mockUpdateLinode);
  });

  it('should preform request update linode until condition is met');

  it('should delete linode', async () => {
    const f = deleteLinode('linode_1');

    expect(f).to.be.a('function');
  });
}));

describe('actions/linodes/power', sinon.test(() => {
  let sandbox = null;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  const mockBootingResponse = {
    type: UPDATE_LINODE,
    linode: { id: 'foo', state: 'booting' },
  };

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
