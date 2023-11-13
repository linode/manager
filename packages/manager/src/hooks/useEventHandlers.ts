import React from 'react';

import { EventWithStore, events$ } from 'src/events';
import { oauthClientsEventHandler } from 'src/queries/accountOAuth';
import { databaseEventsHandler } from 'src/queries/databases';
import { domainEventsHandler } from 'src/queries/domains';
import { firewallEventsHandler } from 'src/queries/firewalls';
import { imageEventsHandler } from 'src/queries/images';
import { linodeEventsHandler } from 'src/queries/linodes/events';
import { diskEventHandler } from 'src/queries/linodes/events';
import { nodebalanacerEventHandler } from 'src/queries/nodebalancers';
import { sshKeyEventHandler } from 'src/queries/profile';
import { supportTicketEventHandler } from 'src/queries/support';
import { tokenEventHandler } from 'src/queries/tokens';
import { volumeEventsHandler } from 'src/queries/volumes';

const eventHandlers: {
  filter: (event: EventWithStore) => boolean;
  handler: (event: EventWithStore) => void;
}[] = [
  {
    filter: ({ event }) =>
      event.action.startsWith('database') && !event._initial,
    handler: databaseEventsHandler,
  },
  {
    filter: ({ event }) =>
      event.action.startsWith('domain') &&
      !event._initial &&
      event.entity !== null,
    handler: domainEventsHandler,
  },
  {
    filter: ({ event }) => event.action.startsWith('volume') && !event._initial,
    handler: volumeEventsHandler,
  },
  {
    filter: ({ event }) =>
      (event.action.startsWith('image') || event.action === 'disk_imagize') &&
      !event._initial,
    handler: imageEventsHandler,
  },
  {
    filter: ({ event }) => event.action.startsWith('token') && !event._initial,
    handler: tokenEventHandler,
  },
  {
    filter: ({ event }) =>
      event.action.startsWith('user_ssh_key') && !event._initial,
    handler: sshKeyEventHandler,
  },
  {
    filter: ({ event }) =>
      event.action.startsWith('firewall') && !event._initial,
    handler: firewallEventsHandler,
  },
  {
    filter: ({ event }) =>
      event.action.startsWith('nodebalancer') && !event._initial,
    handler: nodebalanacerEventHandler,
  },
  {
    filter: ({ event }) =>
      event.action.startsWith('oauth_client') && !event._initial,
    handler: oauthClientsEventHandler,
  },
  {
    filter: ({ event }) =>
      (event.action.startsWith('linode') ||
        event.action.startsWith('backups')) &&
      !event._initial,
    handler: linodeEventsHandler,
  },
  {
    filter: ({ event }) => event.action.startsWith('ticket') && !event._initial,
    handler: supportTicketEventHandler,
  },
  {
    filter: ({ event }) => event.action.startsWith('disk') && !event._initial,
    handler: diskEventHandler,
  },
];

export const useEventHandlers = () => {
  React.useEffect(() => {
    const subscriptions = eventHandlers.map(({ filter, handler }) =>
      events$.filter(filter).subscribe(handler)
    );

    return () => {
      subscriptions.forEach((sub) => sub.unsubscribe());
    };
  }, []);
};
