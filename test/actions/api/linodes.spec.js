import sinon from 'sinon';
import { expect, assert } from 'chai';
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
  deleteLinode,
} from '~/actions/api/linodes';
import { mockContext } from '~/../test/mocks';
import * as fetch from '~/fetch';

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
        auth, dispatch, getState, fetchStub,
      }) => {
      const f = fetchLinodes();

      await f(dispatch, getState);

      expect(fetchStub.calledWith(
        auth.token, '/linodes?page=1')).to.equal(true);
      expect(dispatch.calledWith({
        type: UPDATE_LINODES,
        response: mockFetchResponse,
      })).to.equal(true);
    }, mockFetchResponse);
  });

  const mockUpdateLinode = { id: 'linode_1' };

  it('should update linode', async () => {
    await mockContext(sandbox, async ({
        auth, dispatch, getState, fetchStub,
      }) => {
      const f = updateLinode('linode_1');

      await f(dispatch, getState);

      expect(fetchStub.calledWith(
        auth.token, '/linodes/linode_1')).to.equal(true);
      expect(dispatch.calledWith({
        type: UPDATE_LINODE,
        linode: mockUpdateLinode,
      })).to.equal(true);
    }, mockUpdateLinode);
  });

  it('should preform request update linode until condition is met', async () => {
    const fetchStub = sandbox.stub(fetch, 'fetch');
    fetchStub.onCall(0).returns({ json: () => ({ state: 'provisioning' }) });
    fetchStub.onCall(1).returns({ json: () => ({ state: 'provisioning' }) });
    fetchStub.returns({ json: () => ({ state: 'running' }) });

    const dispatch = sandbox.spy();
    const getState = sandbox.stub();

    const f = updateLinodeUntil('linode_1', v => v.state === 'running', 1);

    const state = {
     authentication: { token: 'token' },
     api: { linodes: { linodes: { linode_1: { state: 'provisioning' } } } },
    };
    getState.returns(state);

    await f(dispatch, getState);
    expect(fetchStub.calledThrice).to.equal(true);
    expect(fetchStub.calledWith('token', '/linodes/linode_1'));

    expect(dispatch.calledWith({
      type: UPDATE_LINODE,
      linode: { state: 'running' },
    })).to.equal(true);
    expect(dispatch.callCount).to.equal(5);
  });

  it('should return function with deleteLinode', async () => {
    const f = deleteLinode('linode_1');

    expect(f).to.be.a('function');
  });

  const emptyResponse = {};

  it('should call delete linode endpoint', async () => {
    await mockContext(sandbox, async ({
        auth, dispatch, getState, fetchStub,
      }) => {
      const f = deleteLinode('linode_1');

      await f(dispatch, getState);

      expect(fetchStub.calledWith(
        auth.token, '/linodes/linode_1', { method: 'DELETE' })).to.equal(true);
      expect(dispatch.calledWith({
        type: DELETE_LINODE,
        id: 'linode_1',
      })).to.equal(true);
    }, emptyResponse);
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
    await mockContext(sandbox, async ({
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
    await mockContext(sandbox, async ({
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
    await mockContext(sandbox, async ({
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
