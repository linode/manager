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

import type { Event } from '@linode/api-v4';
import type { QueryClient } from 'react-query';

export interface EventHandlerData {
  event: Event;
  queryClient: QueryClient;
}

export const eventHandlers: {
  filter: (event: Event) => boolean;
  handler: (data: EventHandlerData) => void;
}[] = [
  {
    filter: (event) => event.action.startsWith('database'),
    handler: databaseEventsHandler,
  },
  {
    filter: (event) =>
      event.action.startsWith('domain') && event.entity !== null,
    handler: domainEventsHandler,
  },
  {
    filter: (event) => event.action.startsWith('volume'),
    handler: volumeEventsHandler,
  },
  {
    filter: (event) =>
      event.action.startsWith('image') || event.action === 'disk_imagize',
    handler: imageEventsHandler,
  },
  {
    filter: (event) => event.action.startsWith('token'),
    handler: tokenEventHandler,
  },
  {
    filter: (event) => event.action.startsWith('user_ssh_key'),
    handler: sshKeyEventHandler,
  },
  {
    filter: (event) => event.action.startsWith('firewall'),
    handler: firewallEventsHandler,
  },
  {
    filter: (event) => event.action.startsWith('nodebalancer'),
    handler: nodebalanacerEventHandler,
  },
  {
    filter: (event) => event.action.startsWith('oauth_client'),
    handler: oauthClientsEventHandler,
  },
  {
    filter: (event) =>
      event.action.startsWith('linode') || event.action.startsWith('backups'),
    handler: linodeEventsHandler,
  },
  {
    filter: (event) => event.action.startsWith('ticket'),
    handler: supportTicketEventHandler,
  },
  {
    filter: (event) => event.action.startsWith('disk'),
    handler: diskEventHandler,
  },
];
