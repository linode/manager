import {
  firewallEventsHandler,
  imageEventsHandler,
  nodebalancerEventHandler,
  oauthClientsEventHandler,
  placementGroupEventHandler,
  sshKeyEventHandler,
  taxIdEventHandler,
  tokenEventHandler,
} from '@linode/queries';
import { useQueryClient } from '@tanstack/react-query';

import { databaseEventsHandler } from 'src/queries/databases/events';
import { domainEventsHandler } from 'src/queries/domains';
import { stackScriptEventHandler } from 'src/queries/stackscripts';
import { supportTicketEventHandler } from 'src/queries/support';
import { volumeEventsHandler } from 'src/queries/volumes/events';

import {
  diskEventHandler,
  linodeEventsHandler,
} from '../queries/linodes/events';

import type { Event } from '@linode/api-v4';
import type { EventHandlerData } from '@linode/queries';
import type { InvalidateQueryFilters } from '@tanstack/react-query';

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
    filter: (event) => event.action.startsWith('placement_group'),
    handler: placementGroupEventHandler,
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
  {
    filter: (event) => event.action.startsWith('tax_id'),
    handler: taxIdEventHandler,
  },
];

export const useEventHandlers = () => {
  const queryClient = useQueryClient();

  /*
   * We wrap invalidateQueries because we need to enforce some options.
   *
   * We set `cancelRefetch` to `false` because it ensures no refetch will
   * be made if there is already a request running. This is important for
   * event handlers because they are envoked once for every event polled.
   */
  const invalidateQueries = (filters: InvalidateQueryFilters) =>
    queryClient.invalidateQueries(filters, { cancelRefetch: false });

  /**
   * Given an event, this function finds the corresponding
   * event handler and invokes it.
   */
  const handleEvent = (event: Event) => {
    for (const eventHandler of eventHandlers) {
      if (eventHandler.filter(event)) {
        eventHandler.handler({ event, invalidateQueries, queryClient });
        return;
      }
    }
  };

  return { handleEvent };
};
