import { Event } from '@linode/api-v4';
import { useSnackbar } from 'notistack';
import React from 'react';
import { useQueryClient } from 'react-query';
import { AppEventHandler } from 'src/App';
import { oauthClientsEventHandler } from 'src/queries/accountOAuth';
import { databaseEventsHandler } from 'src/queries/databases';
import { domainEventsHandler } from 'src/queries/domains';
import { useEventsInfiniteQuery } from 'src/queries/events';
import { firewallEventsHandler } from 'src/queries/firewalls';
import { imageEventsHandler } from 'src/queries/images';
import { linodeEventsHandler } from 'src/queries/linodes/events';
import { nodebalanacerEventHandler } from 'src/queries/nodebalancers';
import { sshKeyEventHandler } from 'src/queries/profile';
import { supportTicketEventHandler } from 'src/queries/support';
import { tokenEventHandler } from 'src/queries/tokens';
import { volumeEventsHandler } from 'src/queries/volumes';

export const useEventHandlers = () => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  /*
   * We want to listen for migration events side-wide
   * It's unpredictable when a migration is going to happen. It could take
   * hours and it could take days. We want to notify to the user when it happens
   * and then update the Linodes in LinodesDetail and LinodesLanding
   */
  const handleMigrationEvent = React.useCallback<AppEventHandler>(
    (event) => {
      const { entity: migratedLinode } = event;
      if (event.action === 'linode_migrate' && event.status === 'finished') {
        enqueueSnackbar(
          `Linode ${migratedLinode!.label} migrated successfully.`,
          {
            variant: 'success',
          }
        );
      }

      if (event.action === 'linode_migrate' && event.status === 'failed') {
        enqueueSnackbar(`Linode ${migratedLinode!.label} migration failed.`, {
          variant: 'error',
        });
      }
    },
    [enqueueSnackbar]
  );

  const eventHandlers = React.useMemo<
    {
      filter: (event: Event) => boolean;
      handler: AppEventHandler;
    }[]
  >(
    () => [
      {
        filter: (event) =>
          event.action.startsWith('database') && !event._initial,
        handler: databaseEventsHandler,
      },
      {
        filter: (event) =>
          event.action.startsWith('domain') &&
          !event._initial &&
          event.entity !== null,
        handler: domainEventsHandler,
      },
      {
        filter: (event) => event.action.startsWith('volume') && !event._initial,
        handler: volumeEventsHandler,
      },
      {
        filter: (event) =>
          (event.action.startsWith('image') ||
            event.action === 'disk_imagize') &&
          !event._initial,
        handler: imageEventsHandler,
      },
      {
        filter: (event) => event.action.startsWith('token') && !event._initial,
        handler: tokenEventHandler,
      },
      {
        filter: (event) =>
          event.action.startsWith('user_ssh_key') && !event._initial,
        handler: sshKeyEventHandler,
      },
      {
        filter: (event) =>
          event.action.startsWith('firewall') && !event._initial,
        handler: firewallEventsHandler,
      },
      {
        filter: (event) =>
          event.action.startsWith('nodebalancer') && !event._initial,
        handler: nodebalanacerEventHandler,
      },
      {
        filter: (event) =>
          event.action.startsWith('oauth_client') && !event._initial,
        handler: oauthClientsEventHandler,
      },
      {
        filter: (event) =>
          (event.action.startsWith('linode') ||
            event.action.startsWith('backups')) &&
          !event._initial,
        handler: linodeEventsHandler,
      },
      {
        filter: (event) => event.action.startsWith('ticket') && !event._initial,
        handler: supportTicketEventHandler,
      },
      {
        filter: (event) =>
          !event._initial && ['linode_migrate'].includes(event.action),
        handler: handleMigrationEvent,
      },
    ],
    [handleMigrationEvent]
  );

  useEventsInfiniteQuery({
    eventHandler: (event) => {
      eventHandlers
        .filter(({ filter }) => filter(event))
        .forEach(({ handler }) => handler(event, queryClient));
    },
  });
};
