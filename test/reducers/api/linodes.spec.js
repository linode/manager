import _ from 'lodash';
import { expect } from 'chai';

import linodes from '~/reducers/api/linodes';
import { TAKE_BACKUP } from '~/actions/api/backups';
import { testLinode } from '~/../test/data';

describe('reducers/api/linodes', () => {
  const backup = {
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
    id: 'backup_123',
    label: '',
  };

  it('adds the new snapshot to the existing backups', () => {
    const linode = {
      ...testLinode,
      _backups: {
        ...testLinode._backups,
        backups: _.filter(testLinode._backups.backups, b =>
          b.type !== 'snapshot'),
      },
    };

    // First has only one backup
    expect(Object.values(linode._backups.backups).length).to.equal(1);

    const l = linodes({ linodes: { [linode.id]: linode } },
                      { backup, type: TAKE_BACKUP, linodes: linode.id });

    const { backups } = l.linodes[linode.id]._backups;
    // Now has two backups
    expect(Object.values(backups).length).to.equal(2);

    // New snapshot exists
    expect('backup_123' in backups).to.equal(true);
    expect(backups.backup_123).to.deep.equal(backup);
  });

  it('replaces the current snapshot with the new one', () => {
    const l = linodes({ linodes: { [testLinode.id]: testLinode } },
                      { backup, type: TAKE_BACKUP, linodes: testLinode.id });

    // Still has only 2 backups
    const { backups } = l.linodes[testLinode.id]._backups;
    expect(Object.values(backups).length).to.equal(2);

    // Old snapshot doesn't exist
    expect('backup_54778596' in backups).to.equal(false);

    // New snapshot exists
    expect('backup_123' in backups).to.equal(true);
    expect(backups.backup_123).to.deep.equal(backup);
  });
});
