import { Params } from '@linode/api-v4';
import { getEvents } from '@linode/api-v4/lib/account';

type EntityTypes = 'linode' | 'volume' | 'nodebalancer' | 'domain';

export const getEventsForEntity = (
  params: Params = {},
  entityType: EntityTypes,
  entityId: number
) =>
  getEvents(params, {
    'entity.type': entityType,
    'entity.id': entityId,
  });
