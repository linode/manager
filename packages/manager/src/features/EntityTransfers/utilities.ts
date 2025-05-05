import { capitalize } from '@linode/utilities';

import type { TransferEntities } from '@linode/api-v4/lib/entity-transfers';

// Return the count of each transferred entity by type, for reporting analytics.
// E.g. { linodes: [ 1234 ], domains: [ 2345, 3456 ]} -> "Linodes: 1, Domains: 2"
export const countByEntity = (transferEntities: TransferEntities) => {
  return Object.entries(transferEntities)
    .map(([entityType, ids]) => {
      return `${capitalize(entityType)}: ${ids.length}`;
    })
    .join(', ');
};
