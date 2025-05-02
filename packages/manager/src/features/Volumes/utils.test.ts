import {
  eventFactory,
  notificationFactory,
  volumeFactory,
} from 'src/factories';

import {
  getDerivedVolumeStatusFromStatusAndEvent,
  getEventProgress,
  getUpgradeableVolumeIds,
} from './utils';

describe('getDerivedVolumeStatusFromStatusAndEvent', () => {
  it('should return the volume status if no event exists', () => {
    const volume = volumeFactory.build();
    expect(
      getDerivedVolumeStatusFromStatusAndEvent(volume.status, undefined)
    ).toBe(volume.status);
  });

  it('should return "migrating" if a migration event is in progress regardless of what the volume status actually is', () => {
    const volume = volumeFactory.build({ status: 'active' });
    const event = eventFactory.build({
      action: 'volume_migrate',
      status: 'started',
    });

    expect(getDerivedVolumeStatusFromStatusAndEvent(volume.status, event)).toBe(
      'migrating'
    );
  });
});

describe('getEventProgress', () => {
  it('should return null if the status is not "started"', () => {
    const event = eventFactory.build({
      percent_complete: 20,
      status: 'finished',
    });
    expect(getEventProgress(event)).toBe(null);
  });

  it('should return null if the API does not return a percentage', () => {
    const event = eventFactory.build({
      percent_complete: null,
      status: 'started',
    });
    expect(getEventProgress(event)).toBe(null);
  });

  it('should return a formatted percentage if the API returns a percentage and the event is "started"', () => {
    const event = eventFactory.build({
      percent_complete: 25,
      status: 'started',
    });
    expect(getEventProgress(event)).toBe('(25%)');
  });
});

describe('getUpgradeableVolumeIds', () => {
  it('should return the id of volumes that have a corresponding upgrade notification', () => {
    const volumes = [
      volumeFactory.build({ id: 1 }),
      volumeFactory.build({ id: 2 }),
      volumeFactory.build({ id: 3 }),
    ];

    const notifications = [
      notificationFactory.build({
        entity: { id: 1 },
        type: 'volume_migration_scheduled',
      }),
      notificationFactory.build({
        entity: { id: 3 },
        type: 'volume_migration_scheduled',
      }),
    ];

    expect(getUpgradeableVolumeIds(volumes, notifications)).toStrictEqual([
      1, 3,
    ]);
  });

  it('should return an empty array given empty data', () => {
    expect(getUpgradeableVolumeIds([], [])).toStrictEqual([]);
  });
});
