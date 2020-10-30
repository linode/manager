import { EntityEvent, Notification } from '@linode/api-v4/lib/account';
import { Linode } from '@linode/api-v4/lib/linodes';
import {
  isEntityEvent,
  isInProgressEvent
} from 'src/store/events/event.helpers';
import { isEventRelevantToLinode } from 'src/store/events/event.selectors';
import { ExtendedEvent } from 'src/store/events/event.types';
import {
  ExtendedStatus,
  MaintenanceType,
  ShallowExtendedLinode
} from 'src/store/linodes/types';

export const shallowExtendLinodes = (
  linodes: Linode[],
  notifications: Notification[],
  events: ExtendedEvent[]
): ShallowExtendedLinode[] => {
  const maintenanceNotifications = notifications.filter(eachNotification => {
    return eachNotification.type === 'maintenance';
  });

  const _linodesInTransition = linodesInTransition(events);

  return linodes.map(thisLinode => {
    const _maintenance = getMaintenanceForLinode(
      maintenanceNotifications,
      thisLinode.id
    );

    return {
      ...thisLinode,
      _maintenance,
      _displayStatus: _maintenance ? 'maintenance' : thisLinode.status,
      _statusPriority: statusToPriority(
        _maintenance
          ? 'maintenance'
          : _linodesInTransition.has(thisLinode.id)
          ? 'busy'
          : thisLinode.status
      ),
      _recentEvent: getRecentEventForLinode(events, thisLinode.id)
    };
  });
};

// Given a list of Events, returns a set of all Linode IDs that are involved in an in-progress event.
export const linodesInTransition = (events: ExtendedEvent[]) => {
  const set = new Set<number>();

  events.forEach(thisEvent => {
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

export const getMaintenanceForLinode = (
  notifications: Notification[],
  linodeId: number
) => {
  const foundNotification = notifications.find(
    eachNotification => eachNotification.entity!.id === linodeId
  );

  return foundNotification
    ? {
        /**
         * "when" and "until" are not guaranteed to exist
         * if we have a maintenance notification
         */
        when: foundNotification.when,
        until: foundNotification.until,
        type: foundNotification.label as MaintenanceType
      }
    : null;
};

// Given a Linode's status, assign it a priority so the "Status" column can be sorted in this way.
export const statusToPriority = (status: ExtendedStatus): number => {
  switch (status) {
    case 'maintenance':
      return 1;
    case 'stopped':
      return 2;
    case 'busy':
      return 3;
    case 'running':
      return 4;
    case 'offline':
      return 5;
    default:
      // All long-running statuses ("resizing", "cloning", etc.) are given priority 3.
      return 3;
  }
};

export const getRecentEventForLinode = (
  events: ExtendedEvent[],
  linodeId: number
) =>
  events.find(
    thisEvent =>
      isWantedEvent(thisEvent) && isEventRelevantToLinode(thisEvent, linodeId)
  );

const isWantedEvent = (e: ExtendedEvent): e is EntityEvent => {
  if (!isInProgressEvent(e)) {
    return false;
  }

  if (isEntityEvent(e)) {
    return e.entity.type === 'linode';
  }

  return false;
};
