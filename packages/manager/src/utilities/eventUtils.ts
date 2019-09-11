import { Event, EventAction } from 'linode-js-sdk/lib/account'

// Removes events we don't want to display.
export const removeBlacklistedEvents = (
  events: Event[] = [],
  blacklist: string[] = []
) => {
  const _blacklist = [...blackListedEvents, ...blacklist];
  return events.filter(eachEvent => !_blacklist.includes(eachEvent.action));
};

// We don't want to display these events because they precede similar events.
// Example: when a user clicks the button to upgrade a Linode, we immediately
// get a `linode_mutate_create` event from the API. Moments later, we get back
// ANOTHER event, `linode_mutate`, with a status of `scheduled`. That's the event
// we want to display, because it will be updated via other events with the same ID.
const blackListedEvents: EventAction[] = [
  'linode_mutate_create', // This event occurs when an upgrade is first initiated.
  'linode_resize_create', // This event occurs when a resize is first initiated.
  'linode_migrate_datacenter_create' // This event occurs when a cross DC migration is first initiated.
];
