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
      { id: 'linode_1' },
      { id: 'linode_2' },
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
    const fn = fetchLinode('linode_1');
    await expectRequest(fn, '/linodes/linode_1',
      d => expect(d.args[0]).to.deep.equal({
        type: UPDATE_LINODE,
        linode: mockResponse.linodes[0],
        linodes: 'linode_1',
      }), mockResponse.linodes[0], null, freshState);
  });

  it('should preform request update linode until condition is met', async () => {
    const fetchStub = sandbox.stub(fetch, 'fetch');
    fetchStub.onCall(0).returns({ json: () => ({ state: 'provisioning' }) });
    fetchStub.onCall(1).returns({ json: () => ({ state: 'provisioning' }) });
    fetchStub.returns({ json: () => ({ state: 'running' }) });

    const dispatch = sandbox.spy();
    const getState = sandbox.stub();

    const f = fetchLinodeUntil('linode_1', v => v.state === 'running', 1);

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

  it('should call delete linode endpoint', async () => {
    const fn = deleteLinode('linode_1');
    await expectRequest(fn, '/linodes/linode_1',
      d => expect(d.args[0]).to.deep.equal({
        type: DELETE_LINODE,
        linodes: 'linode_1',
      }));
  });
});

describe('actions/linodes/configs', async () => {
  it('should return function with deleteLinodeConfig', async () => {
    const f = deleteLinodeConfig('linode_1', 'config_1');
    expect(f).to.be.a('function');
  });

  it('should call delete linode config endpoint', async () => {
    const fn = deleteLinodeConfig('linode_1234', 'config_12345');
    await expectRequest(fn, '/linodes/linode_1234/configs/config_12345',
      d => expect(d.args[0]).to.deep.equal({
        type: DELETE_LINODE_CONFIG,
        linodes: 'linode_1234',
        configs: 'config_12345',
      }), null, { method: 'DELETE' });
  });
});

describe('actions/linodes/power', async () => {
  function power(testFn, name, path, state) {
    it(name, async () => {
      const fn = testFn('linode_1234');
      await expectRequest(fn, `/linodes/linode_1234/${path}`,
        (d, n) => n === 0 && expect(d.args[0]).to.deep.equal({
          type: UPDATE_LINODE,
          linode: { id: 'linode_1234', state },
        }), null, { method: 'POST', body: '{"config":null}' });
    });
  }

  power(powerOnLinode, 'powerOnLinode', 'boot', 'booting');
  power(powerOffLinode, 'powerOffLinode', 'shutdown', 'shutting_down');
  power(rebootLinode, 'rebootLinode', 'reboot', 'rebooting');
});
