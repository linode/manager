import { Event } from '@linode/api-v4/lib/account';
import {
  isPrimaryEntity,
  isSecondaryEntity
} from 'src/store/events/event.selectors';
import { capitalizeAllWords } from 'src/utilities/capitalize';
import { ExtendedEvent } from 'src/store/events/event.types';

export const transitionStatus = [
  'booting',
  'shutting_down',
  'rebooting',
  'provisioning',
  'deleting',
  'migrating',
  'resizing',
  'rebuilding',
  'restoring',
  'cloning',
  'edit_mode'
];

export const transitionAction = [
  'linode_snapshot',
  'disk_resize',
  'backups_restore',
  'disk_imagize',
  'disk_duplicate',
  'linode_mutate',
  'linode_clone',
  'linode_migrate_datacenter'
];

export const linodeInTransition = (
  status: string,
  recentEvent?: Event
): boolean => {
  if (transitionStatus.includes(status)) {
    return true;
  }

  return (
    recentEvent !== undefined &&
    transitionAction.includes(recentEvent.action || '') &&
    recentEvent.percent_complete !== null &&
    recentEvent.percent_complete < 100
  );
};

export const transitionText = (
  status: string,
  linodeId: number,
  recentEvent?: Event
): string => {
  // `linode_mutate` is a special case, because we want to display
  // "Upgrading" instead of "Mutate".

  // @todo @tdt: use a map instead (event_type to display name)
  if (recentEvent?.action === 'linode_mutate') {
    return 'Upgrading';
  }

  if (recentEvent?.action === 'linode_clone') {
    if (isPrimaryEntity(recentEvent, linodeId)) {
      return 'Cloning';
    }
    if (isSecondaryEntity(recentEvent, linodeId)) {
      return 'Creating';
    }
  }

  if (recentEvent?.action === 'linode_migrate_datacenter') {
    return 'Migrating';
  }

  let event;
  if (recentEvent && transitionAction.includes(recentEvent.action)) {
    event = recentEvent.action.replace('linode_', '').replace('_', ' ');
  } else {
    event = status.replace('_', ' ');
  }
  return capitalizeAllWords(event);
};

// There are two possibilities here:
//
// 1. "Cloning from <linode_label>"
// 2. "Cloning to <linode_label>"
//
// This function builds this message based on the event, its primary and
// secondary entities, and the Linode ID.
export const buildLinodeCloneTransitionText = (
  event: Event,
  linodeId: number,
  cmr?: boolean
) => {
  let text = 'Cloning';

  if (cmr !== true) {
    if (isPrimaryEntity(event, linodeId)) {
      const secondaryEntityLabel = event?.secondary_entity?.label;
      if (secondaryEntityLabel) {
        text += ` to: ${secondaryEntityLabel}`;
      }
    }

    if (isSecondaryEntity(event, linodeId)) {
      const primaryEntityLabel = event?.entity?.label;
      if (primaryEntityLabel) {
        text += ` from: ${primaryEntityLabel}`;
      }
    }
  }

  return text;
};

// Return the progress of an event if one is given, otherwise return a default
// of 100. This is useful in the situation where a Linode has recently completed
// an in-progress event, but we don't have the updated status from the API  yet.
// In this case it doesn't have a recentEvent attached (since it has completed),
// but its status is still briefly in transition, so give it a progress of 100.
export const getProgressOrDefault = (
  event?: ExtendedEvent,
  defaultProgress = 100
) => event?.percent_complete ?? defaultProgress;
