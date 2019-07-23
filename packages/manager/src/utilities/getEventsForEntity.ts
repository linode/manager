import { getEvents } from 'src/services/account';

type EntityTypes = 'linode' | 'volume' | 'nodebalancer' | 'domain';

export const getEventsForEntity = (
  params: any = {},
  entityType: EntityTypes,
  entityId: number
) =>
  getEvents(params, {
    'entity.type': entityType,
    'entity.id': entityId
  });
