import Factory from 'src/factories/factoryProxy';

import type { Quota } from '@linode/api-v4/lib/quotas/types';

export const quotaFactory = Factory.Sync.makeFactory<Quota>({
  description: 'Maximimum number of vCPUs allowed',
  quota_id: Factory.each((id) => id),
  quota_limit: 50,
  quota_name: 'Linode Dedicated vCPUs',
  region_applied: 'us-east',
  resource_metric: 'CPU',
  used: 25,
});
