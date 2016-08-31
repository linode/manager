import sinon from 'sinon';
import { expect } from 'chai';
import {
  powerOnLinode,
  powerOffLinode,
  rebootLinode,
  UPDATE_LINODE,
  UPDATE_LINODES,
  DELETE_LINODE,
  DELETE_LINODE_CONFIG,
  fetchLinodes,
  fetchLinode,
  fetchLinodeUntil,
  deleteLinode,
  deleteLinodeConfig,
} from '~/actions/api/linodes';
import * as fetch from '~/fetch';
import { expectRequest } from '@/common';
import { freshState } from '@/data';

describe('actions/api/linodes', async () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const mockResponse = {
    linodes: [
      { id: 1 },
      { id: 2 },
    ],
    total_pages: 3,
    total_results: 25 * 3 - 4,
    page: 1,
  };

  it('should fetch linodes', async () => {
    const fn = fetchLinodes();
    await expectRequest(fn, '/linodes?page=1',
      d => expect(d.args[0]).to.deep.equal({
        type: UPDATE_LINODES,
        response: mockResponse,
      }), mockResponse, null, freshState);
  });

  it('should update linode', async () => {
    const fn = fetchLinode(1);
    await expectRequest(fn, '/linodes/1',
      d => expect(d.args[0]).to.deep.equal({
        type: UPDATE_LINODE,
        linode: mockResponse.linodes[0],
        linodes: 1,
      }), mockResponse.linodes[0], null, freshState);
  });

  it('should perform request update linode until condition is met', async () => {
    const fetchStub = sandbox.stub(fetch, 'fetch');
    fetchStub.onCall(0).returns({ json: () => ({ state: 'provisioning' }) });
    fetchStub.onCall(1).returns({ json: () => ({ state: 'provisioning' }) });
    fetchStub.returns({ json: () => ({ state: 'running' }) });

    const dispatch = sandbox.spy();
    const getState = sandbox.stub();

    const f = fetchLinodeUntil(1234, v => v.state === 'running', 1);

    const state = {
      authentication: { token: 'token' },
      api: { linodes: { linodes: { 1234: { state: 'provisioning' } } } },
    };
    getState.returns(state);

    await f(dispatch, getState);
    expect(fetchStub.calledThrice).to.equal(true);
    expect(fetchStub.calledWith('token', '/linodes/1234'));

    expect(dispatch.calledWith({
      type: UPDATE_LINODE,
      linode: { state: 'running' },
      linodes: 1234,
    })).to.equal(true);
    expect(dispatch.callCount).to.equal(5);
  });

  it('should return function with deleteLinode', async () => {
    const f = deleteLinode('linode_1');
    expect(f).to.be.a('function');
  });

  it('should call delete linode endpoint', async () => {
    const fn = deleteLinode(1);
    await expectRequest(fn, '/linodes/1',
      d => expect(d.args[0]).to.deep.equal({
        type: DELETE_LINODE,
        linodes: 1,
      }));
  });
});

describe('actions/linodes/configs', async () => {
  it('should return function with deleteLinodeConfig', async () => {
    const f = deleteLinodeConfig(1, 1);
    expect(f).to.be.a('function');
  });

  it('should call delete linode config endpoint', async () => {
    const fn = deleteLinodeConfig(1234, 12345);
    await expectRequest(fn, '/linodes/1234/configs/12345',
      d => expect(d.args[0]).to.deep.equal({
        type: DELETE_LINODE_CONFIG,
        linodes: 1234,
        configs: 12345,
      }), null, { method: 'DELETE' });
  });
});

describe('actions/linodes/power', async () => {
  function power(testFn, name, path, state) {
    it(name, async () => {
      const fn = testFn(1234);
      await expectRequest(fn, `/linodes/1234/${path}`,
        (d, n) => n === 0 && expect(d.args[0]).to.deep.equal({
          type: UPDATE_LINODE,
          linode: { id: 1234, state },
          linodes: 1234,
        }), null, { method: 'POST', body: '{"config":null}' });
    });
  }

  power(powerOnLinode, 'powerOnLinode', 'boot', 'booting');
  power(powerOffLinode, 'powerOffLinode', 'shutdown', 'shutting_down');
  power(rebootLinode, 'rebootLinode', 'reboot', 'rebooting');
});
