import { Event, EventAction } from '@linode/api-v4/lib/account';
import {
  isEventRelevantToLinode,
  isPrimaryEntity,
  isSecondaryEntity,
} from 'src/store/events/event.selectors';
import { capitalizeAllWords } from 'src/utilities/capitalize';
import { isInProgressEvent } from 'src/store/events/event.helpers';
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
  'edit_mode',
];

const transitionActionMap: Partial<Record<EventAction, string>> = {
  backups_restore: 'Backups Restore',
  linode_snapshot: 'Snapshot',
  linode_mutate: 'Upgrading',
  linode_clone: 'Cloning',
  linode_migrate_datacenter: 'Migrating',
  disk_resize: 'Disk Resizing',
  disk_imagize: 'Capturing Image',
  disk_duplicate: 'Disk Duplicating',
};

export const linodeInTransition = (
  status: string,
  recentEvent?: Event
): boolean => {
  if (transitionStatus.includes(status)) {
    return true;
  }

  return (
    recentEvent !== undefined &&
    transitionActionMap.hasOwnProperty(recentEvent.action) &&
    recentEvent.percent_complete !== null &&
    recentEvent.percent_complete < 100
  );
};

export const transitionText = (
  status: string,
  linodeId: number,
  recentEvent?: Event
): string | undefined => {
  if (recentEvent?.action === 'linode_clone') {
    if (isPrimaryEntity(recentEvent, linodeId)) {
      return 'Cloning';
    }
    if (isSecondaryEntity(recentEvent, linodeId)) {
      return 'Creating';
    }
  }

  if (recentEvent && transitionActionMap[recentEvent.action]) {
    return transitionActionMap[recentEvent.action];
  }

  return capitalizeAllWords(status.replace('_', ' '));
};

// Given a list of Events, returns a set of all Linode IDs that are involved in an in-progress event.
export const linodesInTransition = (events: Event[]) => {
  const set = new Set<number>();

  events.forEach((thisEvent) => {
    const { entity, secondary_entity } = thisEvent;
    if (isInProgressEvent(thisEvent)) {
      if (entity?.type === 'linode') {
        set.add(entity.id);
      } else if (secondary_entity?.type === 'linode') {
        set.add(secondary_entity.id);
      }
    }
  });

  return set;
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

// Linodes have a literal "status" given by the API (linode.status). There are
// states the Linode can be in which aren't entirely communicated with the
// status field, however. Example: Linode A can be cloning to another Linode,
// but have an unrelated status like "running" or "offline". These states can be
// determined by events with the following actions.
const eventsWithSecondaryStatus: EventAction[] = [
  'disk_duplicate',
  'disk_resize',
  'disk_imagize',
  'linode_clone',
  'linode_snapshot',
  'linode_migrate',
  'linode_migrate_datacenter',
  'linode_mutate',
];

export const isEventWithSecondaryLinodeStatus = (
  event: Event,
  linodeId: number
) => {
  return (
    isEventRelevantToLinode(event, linodeId) &&
    eventsWithSecondaryStatus.includes(event.action)
  );
};
