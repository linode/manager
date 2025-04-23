import type { Event, Notification, Volume } from '@linode/api-v4';
import type { Status } from 'src/components/StatusIcon/StatusIcon';

export const volumeStatusIconMap: Record<Volume['status'], Status> = {
  active: 'active',
  creating: 'other',
  key_rotating: 'other',
  migrating: 'other',
  offline: 'inactive',
  resizing: 'other',
};

/**
 * Given an in-progress event and a volume's status, this function
 * returns a volume's status with event info taken into account.
 *
 * We do this to provide users with a real-time feeling experience
 * without having to refetch a volume's status aggressively.
 *
 * @param status The actual volume status from the volumes endpoint
 * @param event An in-progress event for the volume
 * @returns a volume status
 */
export const getDerivedVolumeStatusFromStatusAndEvent = (
  status: Volume['status'],
  event: Event | undefined
): Volume['status'] => {
  if (event === undefined) {
    return status;
  }

  if (event.action === 'volume_migrate' && event.status === 'started') {
    return 'migrating';
  }

  return status;
};

/**
 * Returns a nicely formated percentage from an event
 * only if the event is in progress and has a percentage.
 *
 * This allows us to show the user the progress of a
 * volume migration.
 *
 * @returns "(50%)" for example
 */
export const getEventProgress = (event: Event | undefined) => {
  if (
    event === undefined ||
    event.percent_complete === null ||
    event.status !== 'started'
  ) {
    return null;
  }

  return `(${event.percent_complete}%)`;
};

/**
 * Returns an array of IDs of Volumes that are scheduled to be upgraded.
 *
 * @param volumes - Array from which to retrieve upgradeable Volumes.
 * @param notifications - Notifications containing Volume migration statuses.
 *
 * @returns Array of upgradeable Volume IDs.
 */
export const getUpgradeableVolumeIds = (
  volumes: Volume[],
  notifications: Notification[]
) => {
  return notifications
    .filter(
      (notification) => notification.type === 'volume_migration_scheduled'
    )
    .reduce((volumeIds: number[], notification: Notification) => {
      const upgradeableVolume = volumes.find(
        (volume) => volume.id === notification.entity?.id
      );
      if (upgradeableVolume) {
        volumeIds.push(upgradeableVolume.id);
      }
      return volumeIds;
    }, []);
};
