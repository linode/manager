import { ApplicationStore } from 'src/store';

export type EntityType = 'linode' | 'nodebalancer';

/**
 * The store uses different structures for storing entity data. Ideally we would use the
 * same pattern for all entities (items and itemsByID), which would make this logic
 * much simpler.
 *
 * @param entityType
 * @param entityID
 *
 * Usage:
 *
 * getEntityByIDFromStore('linode', 123456) => Linode | undefined
 *
 */
export const getEntityByIDFromStore = (
  entityType: EntityType,
  entityID: number | string,
  store: ApplicationStore
) => {
  if (!entityType || !entityID) {
    return;
  }
  const _store = store.getState();
  const { linodes } = _store.__resources;
  switch (entityType) {
    case 'linode':
      return linodes.itemsById[entityID];
    default:
      return;
  }
};
