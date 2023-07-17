import { Params } from '@linode/api-v4';
import { getEvents } from '@linode/api-v4/lib/account';

type EntityTypes = 'domain' | 'linode' | 'nodebalancer' | 'volume';

export const getEventsForEntity = (
  params: Params = {},
  entityType: EntityTypes,
  entityId: number
) =>
  getEvents(params, {
    'entity.id': entityId,
    'entity.type': entityType,
  });
