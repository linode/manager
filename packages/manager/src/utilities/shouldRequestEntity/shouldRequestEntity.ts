import { REFRESH_INTERVAL } from 'src/constants';
import { MappedEntityState2 as MappedEntityState } from 'src/store/types';

/**
 * In our Redux data shape, we initialize lastUpdated to 0 and only update it
 * on a successful complete request (e.g. a getAllLinodes()). Whenever making
 * a request, we set the entity's loading property to true.
 *
 * An entity that is not loading and whose lastUpdated is 0 has never been requested.
 * We can also determine whether an entity is stale by subtracting its lastUpdated
 * from a constant refresh interval.
 */
export const shouldRequestEntity = (
  entity: MappedEntityState<any>,
  refreshInterval: number = REFRESH_INTERVAL
) => {
  if (!entity) {
    // For nested entity states, usually this means we've never requested
    // that entity, so it's best to trigger a request.
    return true;
  }
  const isPastInterval = Date.now() - entity.lastUpdated > refreshInterval;
  return !entity.loading && isPastInterval;
};

export const entityHasNeverBeenRequested = (entity: MappedEntityState<any>) => {
  if (!entity) {
    // For nested entity states, usually this means we've never requested
    // that entity, so it's best to trigger a request.
    return true;
  }
  return !entity.loading && entity.lastUpdated === 0;
};
