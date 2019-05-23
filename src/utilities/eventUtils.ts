// Removes events we don't want to display.
export const removeBlacklistedEvents = (events: Linode.Event[] = []) => {
  return events.filter(
    eachEvent => !blackListedEvents.includes(eachEvent.action)
  );
};

// We don't want to display these events because they precede similar events.
// Example: when a user clicks the button to upgrade a Linode, we immediately
// get a `linode_mutate_create` event from the API. Moments later, we get back
// ANOTHER event, `linode_mutate`, with a status of `scheduled. That's the event
// we want to display, because it will be updated via other events with the same ID.
const blackListedEvents: Linode.EventAction[] = [
  'linode_mutate_create', // This event occurs when an upgrade is first initiated.
  'linode_resize_create' // This event occurs when a resize is first initiated.
];
