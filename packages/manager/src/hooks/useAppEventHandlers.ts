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
import { nodebalanacerEventHandler } from 'src/queries/nodebalancers';
import { sshKeyEventHandler } from 'src/queries/profile';
import { supportTicketEventHandler } from 'src/queries/support';
import { tokenEventHandler } from 'src/queries/tokens';
import { volumeEventsHandler } from 'src/queries/volumes';
import { ApplicationStore, useApplicationStore } from 'src/store';
import { configEventHandler } from 'src/store/linodes/config/config.events';
import { diskStoreEventHandler } from 'src/store/linodes/disk/disk.events';
import { linodeStoreEventsHandler } from 'src/store/linodes/linodes.events';
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
      handlers: AppEventHandler[];
    }[]
  >(
    () => [
      {
        filter: (event) => event.action.startsWith('database'),
        handlers: [databaseEventsHandler],
      },
      {
        filter: (event) =>
          event.action.startsWith('domain') && event.entity !== null,
        handlers: [domainEventsHandler],
      },
      {
        filter: (event) => event.action.startsWith('volume'),
        handlers: [volumeEventsHandler],
      },
      {
        filter: (event) =>
          event.action.startsWith('image') || event.action === 'disk_imagize',
        handlers: [imageEventsHandler],
      },
      {
        filter: (event) => event.action.startsWith('token'),
        handlers: [tokenEventHandler],
      },
      {
        filter: (event) => event.action.startsWith('user_ssh_key'),
        handlers: [sshKeyEventHandler],
      },
      {
        filter: (event) => event.action.startsWith('firewall'),
        handlers: [firewallEventsHandler],
      },
      {
        filter: (event) => event.action.startsWith('nodebalancer'),
        handlers: [nodebalanacerEventHandler],
      },
      {
        filter: (event) => event.action.startsWith('oauth_client'),
        handlers: [oauthClientsEventHandler],
      },
      {
        filter: (event) =>
          event.action.startsWith('linode') ||
          event.action.startsWith('backups'),
        handlers: [linodeEventsHandler, linodeStoreEventsHandler],
      },
      {
        filter: (event) => event.action.startsWith('ticket'),
        handlers: [supportTicketEventHandler],
      },
      {
        filter: (event) => event.action.startsWith('longviewclient'),
        handlers: [longviewEventHandler],
      },
      {
        filter: (event) => event.action.startsWith('disk'),
        handlers: [diskEventHandler, diskStoreEventHandler],
      },
      {
        filter: (event) => event.action.startsWith('linode_config'),
        handlers: [configEventHandler],
      },
    ],
    []
  );

  useEventsInfiniteQuery({
    eventHandler: (event) => {
      eventHandlers
        .filter(({ filter }) => filter(event))
        .flatMap(({ handlers }) => handlers)
        .forEach((handler) => handler(event, queryClient, store));
    },
  });
};
