import sinon from 'sinon';
import { expect } from 'chai';
import * as actions from '~/linodes/actions/detail/backups';
import * as fetch from '~/fetch';
import { testLinode } from '~/../test/data';

describe('linodes/actions/detail/backups', () => {
  describe('selectBackup', () => {
    it('should return a SELECT_BACKUP action', () => {
      expect(actions.selectBackup('backup_1234'))
        .to.deep.equal({
          type: actions.SELECT_BACKUP,
          id: 'backup_1234',
        });
    });
  });

  describe('selectTargetLinode', () => {
    it('should return a SELECT_TARGET_LINODE action', () => {
      expect(actions.selectTargetLinode('linode_1234'))
        .to.deep.equal({
          type: actions.SELECT_TARGET_LINODE,
          id: 'linode_1234',
        });
    });
  });

  describe('setTimeOfDay', () => {
    it('should return a SET_TIME_OF_DAY action', () => {
      expect(actions.setTimeOfDay('0000-0200'))
        .to.deep.equal({
          type: actions.SET_TIME_OF_DAY,
          timeOfDay: '0000-0200',
        });
    });
  });

  describe('setDayOfWeek', () => {
    it('should return a SET_DAY_OF_WEEK action', () => {
      expect(actions.setDayOfWeek('tuesday'))
        .to.deep.equal({
          type: actions.SET_DAY_OF_WEEK,
          dayOfWeek: 'tuesday',
        });
    });
  });

  describe('restoreBackup', () => {
    const sandbox = sinon.sandbox.create();

    afterEach(() => {
      sandbox.restore();
    });

    const state = {
      authentication: { token: 'token' },
      api: {
        linodes: {
          linodes: { [testLinode.id]: testLinode },
        },
      },
    };

    it('returns a function', () => {
      const func = actions.restoreBackup('linode_1234', 'linode_1235', 'backup_1234');
      expect(func).to.be.a('function');
    });

    it('performs the HTTP request', async () => {
      const fetchStub = sandbox.stub(fetch, 'fetch')
        .returns({ json: () => 'asdf' });
      const getState = sinon.stub().returns(state);
      const dispatch = sinon.spy();
      const func = actions.restoreBackup('linode_1234', 'linode_1235', 'backup_1234');
      expect(await func(dispatch, getState)).to.equal('asdf');
      expect(dispatch.callCount).to.equal(0);
      expect(fetchStub.calledOnce).to.equal(true);
      expect(fetchStub.calledWith(state.authentication.token,
        '/linodes/linode_1234/backups/backup_1234/restore'));
      const data = fetchStub.firstCall.args[2];
      expect(data.method).to.equal('POST');
      expect(JSON.parse(data.body)).to.deep.equal({
        linode: 'linode_1235',
        overwrite: false,
      });
    });
  });
});
