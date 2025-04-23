# API Events

In order to display Events, Cloud Manager polls the [account/events](https://techdocs.akamai.com/linode-api/reference/get-events) endpoint at a 16 second interval, or every 2 seconds if there are “in-progress” events.

In order to display these messages in the application (Notification Center, /events page), we compose messages according to the Event key (`EventAction`). Each key requires an entry and set of custom messages for each status (`EventStatus`), dictated by API specs. Not every Status is required for a given Action.

## Adding a new Action and Composing Messages

In order to add a new Action, one must add a new key to the read-only `EventActionKeys` constant array in the api-v4 package.
Once that's done, a related entry must be added to the `eventMessages` Event Map. In order to do so, the entry can either be added to an existing Event Factory or a new one. `eventMessages` is strictly typed, so the action needs to be added to an existing factory or a new one, depending on its key (in this example the action starts with `linode_` so it belongs in the `linode.tsx` factory):

```Typescript
import { EventLink } from '../EventLink';

import type { PartialEventMap } from '../types';

export const linode: PartialEventMap<'linode'> = {
  linode_addip: {
    notification: (e) => (
      <>
        An IP address has been <strong>added</strong> to Linode{' '}
        <EventLink event={e} to="entity" />.
      </>
    ),
  },
};
```

The convention to compose the message is as follows:
- Use the `<EventLink />` component for linking `entity` or `secondary_entity`. This component includes a lookup util to format the link `href` according to the feature.
- The bolding should only be applied to:
  - the primary action: (ex: `<strong>created</strong>`) 
  - its correlated negation for negative actions (ex: `could <strong>not</strong> be <strong>created</strong>.`)
- The `message` should be also handled via the `<EventMessage message={e.message} />` in order to handle potential formatting from the API string (ticks to indicate code blocks).
- The message composition can be enhanced by using custom components. For instance, if we need to fetch extra data based on an event entity, we can simply write a new component to include in the message:

```Typescript
export const linode: PartialEventMap<'linode'> = {
  linode_migrate_datacenter: {
    started: (e) => <LinodeMigrateDataCenterMessage event={e} />,
  },
};

const LinodeMigrateDataCenterMessage = ({ event }: { event: Event }) => {
  const { data: linode } = useLinodeQuery(event.entity?.id ?? -1);
  const { data: regions } = useRegionsQuery();
  const region = regions?.find((r) => r.id === linode?.region);

  return (
    <>
      Linode <EventLink event={event} to="entity" /> is being{' '}
      <strong>migrated</strong>
      {region && (
        <>
          {' '}
          to <strong>{region.label}</strong>
        </>
      )}
      .
    </>
  );
};
```

## In Progress Events

Some event messages are meant to be displayed alongside a progress bar to show the user the percentage of the action's completion. When an action is in progress, the polling interval switches to every two seconds to provide real-time feedback.

Despite receiving a `percent_complete` value from the API, not all actions are suitable for displaying visual progress, often because they're too short, or we only receive 0% and 100% from the endpoint. To allow only certain events to feature the progress bar, their action keys must be added to the `ACTIONS_TO_INCLUDE_AS_PROGRESS_EVENTS` constant.

## Displaying Events in snackbars

We can leverage the Event Message factories in order to display events in snackbars/toasts when a given action gets triggered via APIv4.

```Typescript
const { enqueueSnackbar } = useSnackbar();

try {
  const successMessage = getEventMessage({
    action: 'image_upload',
    entity: {
      label: 'Entity',
      url: '/image/123',
    },
    status: 'notification',
  });

  const showToast = (variant: any) =>
  enqueueSnackbar(successMessage, {
    'success',
  });
}, catch {
  const failureMessage = getEventMessage({
    action: 'image_upload',
    // in this case we don't add an entity since we know we can't link to it
    status: 'failed',
  });

  const showToast = (variant: any) =>
  enqueueSnackbar(failureMessage, {
    'error',
  });
}
```

Both `action` and `status` are required. The `entity` and `secondary_entity` can optionally be passed to allow for linking. **Note**: it is possible the Event Message linking will be missing if the action status message expects either value but isn't not provided by the instance call.

If a corresponding status does not exist (ex: "failed"), it's encouraged to add it to the Action. Event if not triggered by the API, it can be useful to have a reusable Event Message to use through the App.
