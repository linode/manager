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
  deleteLinode,
} from '~/actions/api/linodes';
import * as fetch from '~/fetch';

describe('actions/api/linodes', () => {
  const auth = { token: 'token' };

  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const getGetState = (state = {}) => sandbox.stub().returns({
    authentication: auth,
    ...state,
  });
  const getDispatch = () => sandbox.spy();
  const getFetchStub = (rsp) => sandbox.stub(fetch, 'fetch').returns({ json() { return rsp; } });

  const mockResponse = {
    linodes: [
      { id: 'linode_1' },
      { id: 'linode_2' },
    ],
    total_pages: 3,
    total_results: 25 * 3 - 4,
    page: 1,
  };

  it('should fetch linodes', async () => {
    const dispatch = getDispatch();
    const fetchStub = getFetchStub(mockResponse);
    const getState = getGetState();

    const f = fetchLinodes();

    await f(dispatch, getState);

    expect(fetchStub.calledWith(
      auth.token, '/linodes?page=1')).to.equal(true);
    expect(dispatch.calledWith({
      type: UPDATE_LINODES,
      response: mockResponse,
    })).to.equal(true);
  });

  it('should update linode', async () => {
    const dispatch = getDispatch();
    const fetchStub = getFetchStub(mockResponse.linodes[0]);
    const getState = getGetState();

    const f = updateLinode('linode_1');

    await f(dispatch, getState);

    expect(fetchStub.calledWith(
      auth.token, '/linodes/linode_1')).to.equal(true);
    expect(dispatch.calledWith({
      type: UPDATE_LINODE,
      linode: mockResponse.linodes[0],
    })).to.equal(true);
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
    const dispatch = getDispatch();
    const fetchStub = getFetchStub(emptyResponse);
    const getState = getGetState();

    const f = deleteLinode('linode_1');

    await f(dispatch, getState);

    expect(fetchStub.calledWith(
      auth.token, '/linodes/linode_1', { method: 'DELETE' })).to.equal(true);
    expect(dispatch.calledWith({
      type: DELETE_LINODE,
      id: 'linode_1',
    })).to.equal(true);
  });
});

describe('actions/linodes/power', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const auth = { token: 'token' };
  const getGetState = (state = {}) => sandbox.stub().returns({
    authentication: auth,
    ...state,
  });
  const getDispatch = () => sandbox.spy();
  const getFetchStub = (rsp) => sandbox.stub(fetch, 'fetch').returns({ json() { return rsp; } });

  const mockBootingResponse = {
    type: UPDATE_LINODE,
    linode: { id: 'foo', state: 'booting' },
  };


  it('returns linode power boot status', async () => {
    const dispatch = getDispatch();
    const getState = getGetState();
    const fetchStub = getFetchStub(mockBootingResponse);
    const f = powerOnLinode('foo');

    await f(dispatch, getState);

    expect(fetchStub.calledWith(
      auth.token, '/linodes/foo/boot', { method: 'POST' })).to.equal(true);
    expect(dispatch.calledWith({
      type: UPDATE_LINODE,
      linode: { id: 'foo', state: 'booting' },
    })).to.equal(true);
  });

  const mockShuttingDownResponse = {
    ...mockBootingResponse,
    linode: { ...mockBootingResponse.linode, state: 'shutting_down' },
  };

  it('returns linode power shutdown status', async () => {
    const dispatch = getDispatch();
    const getState = getGetState();
    const fetchStub = getFetchStub(mockShuttingDownResponse);
    const f = powerOffLinode('foo');

    await f(dispatch, getState);

    expect(fetchStub.calledWith(
      auth.token, '/linodes/foo/shutdown', { method: 'POST' })).to.equal(true);
    expect(dispatch.calledWith({
      type: UPDATE_LINODE,
      linode: { id: 'foo', state: 'shutting_down' },
    })).to.equal(true);
  });

  const mockRebootingResponse = {
    ...mockBootingResponse,
    linode: { ...mockBootingResponse.linode, state: 'rebooting' },
  };

  it('returns linode power reboot status', async () => {
    const dispatch = getDispatch();
    const getState = getGetState();
    const fetchStub = getFetchStub(mockRebootingResponse);
    const f = rebootLinode('foo');

    await f(dispatch, getState);

    expect(fetchStub.calledWith(
      auth.token, '/linodes/foo/reboot', { method: 'POST' })).to.equal(true);
    expect(dispatch.calledWith({
      type: UPDATE_LINODE,
      linode: { id: 'foo', state: 'rebooting' },
    })).to.equal(true);
  });
});
