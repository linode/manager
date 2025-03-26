import { getEngineFromDatabaseEntityURL } from 'src/utilities/getEventsActionLink';

import { databaseQueries } from './databases';

import type { Engine } from '@linode/api-v4';
import type { EventHandlerData } from 'src/hooks/useEventHandlers';

export const databaseEventsHandler = ({
  event,
  invalidateQueries,
}: EventHandlerData) => {
  if (['failed', 'finished', 'notification'].includes(event.status)) {
    invalidateQueries({
      queryKey: databaseQueries.databases.queryKey,
    });

    /**
     * This is what a Database event entity looks like:
     *
     * "entity": {
     *   "label": "my-db-staging",
     *   "id": 2959,
     *   "type": "database",
     *   "url": "/v4/databases/postgresql/instances/2959"
     * },
     */
    if (event.entity) {
      const engine = getEngineFromDatabaseEntityURL(event.entity.url);

      if (!engine) {
        // eslint-disable-next-line no-console
        return console.warn(
          'Unable to get DBaaS engine from entity URL in event',
          event.id
        );
      }

      invalidateQueries({
        queryKey: databaseQueries.database(engine as Engine, event.entity.id)
          .queryKey,
      });
    }
  }
};
