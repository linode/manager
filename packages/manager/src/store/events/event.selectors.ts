import { Event, EventAction } from '@linode/api-v4/lib/account';
import { State } from './event.reducer';

export const eventsForLinode = (state: State, linodeId: number) => {
  return state.events.filter((event) =>
    isEventRelevantToLinode(event, linodeId)
  );
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
