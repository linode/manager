import { useQueryClient } from '@tanstack/react-query';

import { oauthClientsEventHandler } from 'src/queries/account/oauth';
import { databaseEventsHandler } from 'src/queries/databases/events';
import { domainEventsHandler } from 'src/queries/domains';
import { firewallEventsHandler } from 'src/queries/firewalls';
import { imageEventsHandler } from 'src/queries/images';
import { diskEventHandler } from 'src/queries/linodes/events';
import { linodeEventsHandler } from 'src/queries/linodes/events';
import { nodebalancerEventHandler } from 'src/queries/nodebalancers';
import { sshKeyEventHandler } from 'src/queries/profile/profile';
import { stackScriptEventHandler } from 'src/queries/stackscripts';
import { supportTicketEventHandler } from 'src/queries/support';
import { tokenEventHandler } from 'src/queries/profile/tokens';
import { volumeEventsHandler } from 'src/queries/volumes/events';

import type { Event } from '@linode/api-v4';
import type { QueryClient } from '@tanstack/react-query';

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
    handler: nodebalancerEventHandler,
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
  {
    filter: (event) => event.action.startsWith('stackscript'),
    handler: stackScriptEventHandler,
  },
];

export const useEventHandlers = () => {
  const queryClient = useQueryClient();

  /**
   * Given an event, this function finds the corresponding
   * event handler and invokes it.
   */
  const handleEvent = (event: Event) => {
    for (const eventHandler of eventHandlers) {
      if (eventHandler.filter(event)) {
        eventHandler.handler({ event, queryClient });
        return;
      }
    }
  };

  return { handleEvent };
};
