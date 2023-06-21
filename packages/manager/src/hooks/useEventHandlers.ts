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
          event.action.startsWith('linode') ||
          event.action.startsWith('backups'),
        handler: linodeEventsHandler,
      },
      {
        filter: (event) => event.action.startsWith('ticket'),
        handler: supportTicketEventHandler,
      },
      {
        filter: (event) => ['linode_migrate'].includes(event.action),
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
