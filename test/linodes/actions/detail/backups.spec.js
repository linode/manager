import { expect } from 'chai';
import * as actions from '~/linodes/actions/detail/backups';

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
});
