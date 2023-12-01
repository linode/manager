import { Event, EventAction } from '@linode/api-v4/lib/account';

export const isLongPendingEvent = (event: Event): boolean => {
  const { action, status } = event;
  return status === 'scheduled' && action === 'image_upload';
};

export const isInProgressEvent = (event: Event) => {
  const { percent_complete } = event;
  if (percent_complete === null || isLongPendingEvent(event)) {
    return false;
  } else {
    return percent_complete !== null && percent_complete < 100;
  }
};

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
