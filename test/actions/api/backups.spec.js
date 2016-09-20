import sinon from 'sinon';
import { expect } from 'chai';
import {
  fetchBackups,
  fetchBackup,
  enableBackup,
  cancelBackup,
  takeBackup,
  restoreBackup,
} from '~/actions/api/backups';
import { UPDATE_BACKUP, UPDATE_BACKUPS } from '~/actions/api/linodes';
import { testLinode } from '@/data/linodes';
import { expectRequest } from '@/common';
import { state } from '@/data';

describe('actions/api/backups', async () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const mockResponse = {
    backups: [
      { id: 1 },
      { id: 2 },
    ],
    total_pages: 3,
    total_results: 25 * 3 - 4,
    page: 1,
  };

  it('should fetch backups', async () => {
    const testState = {
      ...state,
      api: {
        ...state.api,
        linodes: {
          ...state.api.linodes,
          linodes: {
            ...state.api.linodes.linodes,
            [testLinode.id]: {
              ...testLinode,
              _backups: {
                totalPages: -1,
                totalResults: -1,
                pagesFetched: [],
                backups: { },
              },
            },
          },
        },
      },
    };
    const fn = fetchBackups(0, 1234);
    await expectRequest(fn, '/linode/instances/1234/backups/?page=1',
      d => expect(d.args[0]).to.deep.equal({
        type: UPDATE_BACKUPS,
        linodes: 1234,
        response: mockResponse,
      }), mockResponse, null, testState);
  });

  it('should fetch backup', async () => {
    const fn = fetchBackup(1234, 1234);
    await expectRequest(fn, '/linode/instances/1234/backups/1234',
      d => expect(d.args[0]).to.deep.equal({
        type: UPDATE_BACKUP,
        linodes: 1234,
        backup: mockResponse.backups[0],
        backups: 1234,
      }), mockResponse.backups[0]);
  });

  it('should enable backups', async () => {
    const fn = enableBackup(1234);
    await expectRequest(fn, '/linode/instances/1234/backups/enable',
      () => {}, null, { method: 'POST' });
  });

  it('should cancel backups', async () => {
    const fn = cancelBackup(1234);
    await expectRequest(fn, '/linode/instances/1234/backups/cancel',
      () => {}, null, { method: 'POST' });
  });

  const takeBackupResponse = {
    type: 'snapshot',
    created: '2016-07-25T16:59:32',
    datacenter: {
      label: 'Newark, NJ',
      datacenter: 'newark',
      id: 'newark',
    },
    updated: '2016-07-25T16:59:32',
    finished: null,
    status: 'pending',
    id: 123,
    label: '',
  };

  it('should take a backup', async () => {
    const fn = takeBackup(1234);
    await expectRequest(fn, '/linode/instances/1234/backups',
      d => expect(d.args[0]).to.deep.equal({
        type: UPDATE_BACKUP,
        linodes: 1234,
        backup: takeBackupResponse,
      }), takeBackupResponse, { method: 'POST' });
  });

  describe('restoreBackup', () => {
    it('returns a function', () => {
      const fn = restoreBackup(1234, 1235, 1234);
      expect(fn).to.be.a('function');
    });

    it('performs the HTTP request', async () => {
      const fn = restoreBackup(1234, 1235, 1234);
      await expectRequest(fn, '/linode/instances/1234/backups/1234/restore',
        () => expect(false).to.equal(true), null, { method: 'POST' });
    });
  });
});
