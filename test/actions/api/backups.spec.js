import sinon from 'sinon';
import { expect } from 'chai';
import {
  UPDATE_BACKUP,
  UPDATE_BACKUPS,
  fetchBackups,
  fetchBackup,
  enableBackup,
  cancelBackup,
} from '~/actions/api/backups';
import * as fetch from '~/fetch';

describe('actions/api/backups', async () => {
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
    backups: [
      { id: 'backup_1' },
      { id: 'backup_2' },
    ],
    total_pages: 3,
    total_results: 25 * 3 - 4,
    page: 1,
  };

  it('should fetch backups', async () => {
    const dispatch = getDispatch();
    const getState = getGetState();
    const fetchStub = getFetchStub(mockResponse);
    const f = fetchBackups(0, 'foo_1');

    await f(dispatch, getState);

    expect(fetchStub.calledWith(
      auth.token, '/linodes/foo_1/backups/?page=1')).to.equal(true);
    expect(dispatch.calledWith({
      type: UPDATE_BACKUPS,
      linodes: 'foo_1',
      response: mockResponse,
    })).to.equal(true);
  });

  it('should fetch backup', async () => {
    const dispatch = getDispatch();
    const fetchStub = getFetchStub(mockResponse.backups[0]);
    const getState = getGetState();

    const f = fetchBackup('linode_1', 'backup_1');

    await f(dispatch, getState);

    expect(fetchStub.calledWith(
      auth.token, '/linodes/linode_1/backups/backup_1')).to.equal(true);
    expect(dispatch.calledWith({
      type: UPDATE_BACKUP,
      linodes: 'linode_1',
      backup: mockResponse.backups[0],
      backups: 'backup_1',
    })).to.equal(true);
  });

  it('should enable backups', async () => {
    const dispatch = getDispatch();
    const getState = getGetState();
    const fetchStub = getFetchStub(mockResponse.backups[0]);
    const f = enableBackup('foo_1');

    await f(dispatch, getState);

    expect(fetchStub.calledWith(
      auth.token, '/linodes/foo_1/backups/enable', { method: 'POST' })).to.equal(true);
    expect(dispatch.calledWith({
      type: UPDATE_BACKUP,
      backup: { id: 'backup_1' },
    })).to.equal(true);
  });

  it('should cancel backups', async () => {
    const dispatch = getDispatch();
    const getState = getGetState();
    const fetchStub = getFetchStub(mockResponse.backups[0]);
    const f = cancelBackup('foo_1');

    await f(dispatch, getState);

    expect(fetchStub.calledWith(
      auth.token, '/linodes/foo_1/backups/cancel', { method: 'POST' })).to.equal(true);
    expect(dispatch.calledWith({
      type: UPDATE_BACKUP,
      backup: { id: 'backup_1' },
    })).to.equal(true);
  });
});
