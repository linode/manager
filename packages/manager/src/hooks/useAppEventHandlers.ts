import { Event } from '@linode/api-v4';
import React from 'react';
import { QueryClient, useQueryClient } from 'react-query';

import { oauthClientsEventHandler } from 'src/queries/accountOAuth';
import { databaseEventsHandler } from 'src/queries/databases';
import { domainEventsHandler } from 'src/queries/domains';
import { useEventsInfiniteQuery } from 'src/queries/events';
import { firewallEventsHandler } from 'src/queries/firewalls';
import { imageEventsHandler } from 'src/queries/images';
import {
  diskEventHandler,
  linodeEventsHandler,
} from 'src/queries/linodes/events';
import { nodebalancerEventHandler } from 'src/queries/nodebalancers';
import { sshKeyEventHandler } from 'src/queries/profile';
import { supportTicketEventHandler } from 'src/queries/support';
import { tokenEventHandler } from 'src/queries/tokens';
import { volumeEventsHandler } from 'src/queries/volumes';
import { ApplicationStore, useApplicationStore } from 'src/store';
import { longviewEventHandler } from 'src/store/longview/longview.events';

export type AppEventHandler = (
  event: Event,
  queryClient: QueryClient,
  store: ApplicationStore
) => void;

export const useAppEventHandlers = () => {
  const queryClient = useQueryClient();
  const store = useApplicationStore();

  const eventHandlers = React.useMemo<
    {
      filter: (event: Event) => boolean;
      handler: AppEventHandler;
    }[]
  >(
    () => [
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
          event.action.startsWith('linode') ||
          event.action.startsWith('backups'),
        handler: linodeEventsHandler,
      },
      {
        filter: (event) => event.action.startsWith('ticket'),
        handler: supportTicketEventHandler,
      },
      {
        filter: (event) => event.action.startsWith('longviewclient'),
        handler: longviewEventHandler,
      },
      {
        filter: (event) => event.action.startsWith('disk'),
        handler: diskEventHandler,
      },
    ],
    []
  );

  useEventsInfiniteQuery({
    eventHandler: (event) => {
      eventHandlers
        .filter(({ filter }) => filter(event))
        .forEach(({ handler }) => handler(event, queryClient, store));
    },
  });
};
