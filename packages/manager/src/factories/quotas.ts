import { Factory } from '@linode/utilities';

import type { Quota, QuotaUsage } from '@linode/api-v4/lib/quotas/types';

export const quotaFactory = Factory.Sync.makeFactory<Quota>({
  description: 'Maximimum number of vCPUs allowed',
  quota_id: Factory.each((id) => id.toString()),
  quota_limit: 50,
  quota_name: 'Linode Dedicated vCPUs',
  quota_type_id: 'linode-dedicated-cpus',
  region_applied: 'us-east',
  resource_metric: 'CPU',
  usage_mode: 'normal',
});

export const quotaUsageFactory = Factory.Sync.makeFactory<QuotaUsage>({
  quota_limit: 50,
  usage: 25,
});
