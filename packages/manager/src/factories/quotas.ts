import Factory from 'src/factories/factoryProxy';

import type { Quota } from '@linode/api-v4/lib/quotas/types';

export const quotaFactory = Factory.Sync.makeFactory<Quota>({
  description: 'Maximimum number of vCPUs allowed',
  quota_id: Factory.each((id) => id),
  quota_limit: 50,
  quota_name: 'Linode Dedicated vCPUs',
  resource_metric: 'CPUs',
  scope: 'us-east',
  service_name: 'Linode Dedicated',
  unit: 'vCPUs',
  used: 25,
});
