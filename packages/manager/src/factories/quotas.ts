import { Factory } from '@linode/utilities';

import type {
  LinodeQuota,
  LkeQuota,
  ObjectStorageEndpointQuota,
  VolumesQuota,
} from '@linode/api-v4';
import type { QuotaUsage } from '@linode/api-v4/lib/quotas/types';

export const linodeQuotaFactory = Factory.Sync.makeFactory<LinodeQuota>({
  description: 'Maximum number of vCPUs allowed',
  quota_id: Factory.each((id) => id.toString()),
  quota_limit: 50,
  quota_name: 'Linode Dedicated vCPUs',
  region_applied: 'us-east',
  resource_metric: 'CPU',
});

export const lkeQuotaFactory = Factory.Sync.makeFactory<LkeQuota>({
  description: 'Maximum allowed number of Clusters',
  quota_id: Factory.each((id) => id.toString()),
  quota_limit: 50,
  quota_name: 'LKE Clusters',
  region_applied: 'us-east',
  resource_metric: 'cluster',
});

export const objEndpointQuotaFactory =
  Factory.Sync.makeFactory<ObjectStorageEndpointQuota>({
    description: 'Max number of buckets allowed',
    quota_id: Factory.each((id) => id.toString()),
    quota_limit: 1000,
    quota_name: 'Buckets',
    quota_type: 'obj-buckets',
    resource_metric: 'bucket',
    has_usage: true,
    s3_endpoint: 'endpoint-1.linodeobjects.com',
    endpoint_type: 'E1',
  });

export const volumesQuotaFactory = Factory.Sync.makeFactory<VolumesQuota>({
  description: 'Maximum storage capacity in us-east region',
  quota_id: Factory.each((id) => id.toString()),
  quota_limit: 51200,
  quota_name: 'Block Storage Capacity',
  quota_type: 'vol-capacity',
  resource_metric: 'gigabyte',
  scope: 'region',
  region: 'us-east',
  has_usage: true,
});

export const quotaUsageFactory = Factory.Sync.makeFactory<QuotaUsage>({
  quota_limit: 50,
  usage: 25,
});
