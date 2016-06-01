import sinon from 'sinon';
import { expect } from 'chai';
import {
  powerOnLinode,
  powerOffLinode,
  rebootLinode,
  UPDATE_LINODE,
} from '../../../src/actions/api/linodes';
import * as fetch from '~/fetch';

describe('actions/linodes/power', sinon.test(() => {
  let sandbox = null;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

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
}));
