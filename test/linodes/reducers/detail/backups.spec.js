import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import backups from '~/linodes/reducers/detail/backups';
import * as actions from '~/linodes/actions/detail/backups';

describe('linodes/reducers/detail/backups', () => {
  it('should handle initial state', () => {
    expect(
      backups(undefined, {})
    ).to.be.eql({
      selectedBackup: null,
      targetLinode: '',
      timeOfDay: '0000-0200',
      dayOfWeek: 'sunday',
    });
  });

  it('should no-op on arbitrary actions', () => {
    const state = { };
    deepFreeze(state);

    expect(backups(state, { type: 'foobar' }))
      .to.deep.equal(state);
  });

  it('should handle SELECT_BACKUP', () => {
    const state = { selectedBackup: null };
    deepFreeze(state);

    expect(backups(state, actions.selectBackup('backup_1234')))
      .to.have.property('selectedBackup').that.equals('backup_1234');
  });

  it('should handle SELECT_TARGET_LINODE', () => {
    const state = { targetLinode: null };
    deepFreeze(state);

    expect(backups(state, actions.selectTargetLinode('linode_1234')))
      .to.have.property('targetLinode').that.equals('linode_1234');
  });

  it('should handle SET_TIME_OF_DAY', () => {
    const state = { timeOfDay: '0000-0200' };
    deepFreeze(state);

    expect(backups(state, actions.setTimeOfDay('0400-0600')))
      .to.have.property('timeOfDay').that.equals('0400-0600');
  });

  it('should handle SET_DAY_OF_WEEK', () => {
    const state = { dayOfWeek: 'sunday' };
    deepFreeze(state);

    expect(backups(state, actions.setDayOfWeek('tuesday')))
      .to.have.property('dayOfWeek').that.equals('tuesday');
  });
});
