import { EntityEvent, Event, EventAction } from '@linode/api-v4/lib/account';
import { DateTime } from 'luxon';

import { parseAPIDate } from './date';

export const isLongPendingEvent = (event: Event): boolean => {
  const { status, action } = event;
  return status === 'scheduled' && action === 'image_upload';
};

export const isInProgressEvent = (
  event: Event
): event is Event & { percent_complete: number } => {
  const { percent_complete } = event;
  if (percent_complete === null || isLongPendingEvent(event)) {
    return false;
  } else {
    return percent_complete !== null && percent_complete < 100;
  }
};

// Calculates the finished (or failed) event timestamp from the created event timestamp by adding the duration;
// if the event is not finished or has not failed, uses the created event timestamp.
export const getEventTimestamp = (event: Event): DateTime => {
  return (event?.status === 'finished' || event?.status === 'failed') &&
    event?.duration
    ? parseAPIDate(event.created).plus({ seconds: event.duration })
    : parseAPIDate(event.created);
};

// Removes events we don't want to display.
export const removeBlocklistedEvents = (
  events: Event[] = [],
  blocklist: string[] = []
) => {
  const _blocklist = [...blockListedEvents, ...blocklist];
  return events.filter((eachEvent) => !_blocklist.includes(eachEvent.action));
};

// We don't want to display these events because they precede similar events.
// Example: when a user clicks the button to upgrade a Linode, we immediately
// get a `linode_mutate_create` event from the API. Moments later, we get back
// ANOTHER event, `linode_mutate`, with a status of `scheduled`. That's the event
// we want to display, because it will be updated via other events with the same ID.
const blockListedEvents: EventAction[] = [
  'linode_mutate_create', // This event occurs when an upgrade is first initiated.
  'linode_resize_create', // This event occurs when a resize is first initiated.
  'linode_migrate_datacenter_create', // This event occurs when a cross DC migration is first initiated.
];

export const isEventRelevantToLinode = (event: Event, linodeId: number) =>
  isPrimaryEntity(event, linodeId) ||
  (isSecondaryEntity(event, linodeId) &&
    isEventRelevantToLinodeAsSecondaryEntity(event));

export const isPrimaryEntity = (event: Event, linodeId: number) =>
  event?.entity?.type === 'linode' && event?.entity?.id === linodeId;

export const isSecondaryEntity = (event: Event, linodeId: number) =>
  event?.secondary_entity?.type === 'linode' &&
  event?.secondary_entity?.id === linodeId;

// Some event types include a Linode as a `secondary_entity`. A subset of these
// events should be included in the `eventsForLinode` selector since they are
// relevant to that Linode.
//
// An example: `clone_linode` events include the source Linode as the `entity`
// and the target Linode as the `secondary_entity`. In this case, we want the
// consumer of the `eventsForLinode` selector to have access to these events so
// it can do things like display progress bars.
export const eventActionsForLinodeAsSecondaryEntity: EventAction[] = [
  'linode_clone',
];
export const isEventRelevantToLinodeAsSecondaryEntity = (event: Event) =>
  eventActionsForLinodeAsSecondaryEntity.includes(event?.action);

export const isEntityEvent = (e: Event): e is EntityEvent => Boolean(e.entity);

export const isEventInProgressDiskImagize = (event: Event): boolean => {
  return (
    event.action === 'disk_imagize' &&
    Boolean(event.secondary_entity) &&
    isInProgressEvent(event)
  );
};

export const isEventImageUpload = (event: Event): boolean => {
  return event.action === 'image_upload';
};

/**
 * Compare the latestTime with the given Linode's created time and return the most recent.
 *
 */
export const mostRecentCreated = (
  latestTime: number,
  current: Pick<Event, 'created'>
) => {
  const time: number = parseAPIDate(current.created).valueOf(); // Unix time (milliseconds)
  return latestTime > time ? latestTime : time;
};
