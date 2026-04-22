import type { ObjectStorageEndpointTypes } from 'src/object-storage';
import type { Region } from 'src/regions';

export type LinodeQuotaResourceMetric = 'CPU' | 'GPU' | 'VPU';
export type LkeQuotaResourceMetric = 'cluster';
export type ObjectStorageEndpointQuotaResourceMetric =
  | 'bucket'
  | 'byte'
  | 'byte_per_second'
  | 'object'
  | 'request';
export type ObjectStorageGlobalQuotaResourceMetric = 'key';
export type VolumesQuotaResourceMetric = 'attachment' | 'gigabyte' | 'volume';

interface QuotaCommon<T> {
  /**
   * Longer explanatory description for the quota.
   */
  description: string;

  /**
   * A unique identifier for the quota.
   */
  quota_id: string;

  /**
   * The account-wide limit for this service, measured in units
   * specified by the `resource_metric` field.
   */
  quota_limit: number;

  /**
   * Customer facing label describing the quota.
   */
  quota_name: string;

  /**
   * The unit of measurement for this service limit.
   */
  resource_metric: T;
}

interface QuotaCommonWithRegionApplied<T> extends QuotaCommon<T> {
  /**
   * The region slug to which this limit applies.
   *
   * OBJ limits are applied by endpoint, not region.
   * This below really just is a `string` type but being verbose helps with reading comprehension.
   */
  region_applied: 'global' | Region['id'];
}

interface QuotaCommonWithUsage<T> extends QuotaCommon<T> {
  /**
   * Determines whether usage information is provided for this quota.
   */
  has_usage: boolean;
}

export type LinodeQuota =
  QuotaCommonWithRegionApplied<LinodeQuotaResourceMetric>;

export type LkeQuota = QuotaCommonWithRegionApplied<LkeQuotaResourceMetric>;

export interface ObjectStorageGlobalQuota
  extends QuotaCommonWithUsage<ObjectStorageGlobalQuotaResourceMetric> {
  /**
   * Represents the quota type.
   */
  quota_type: 'keys';
}

export interface ObjectStorageEndpointQuota
  extends QuotaCommonWithUsage<ObjectStorageEndpointQuotaResourceMetric> {
  /**
   * The OBJ endpoint type to which this limit applies.
   *
   */
  endpoint_type: ObjectStorageEndpointTypes;

  /**
   * Represents the quota type.
   */
  quota_type:
    | 'obj-buckets'
    | 'obj-bytes'
    | 'obj-objects'
    | 'obj-per-ip-concurrent-requests'
    | 'obj-per-ip-egress-throughput'
    | 'obj-per-ip-ingress-throughput'
    | 'obj-total-concurrent-requests'
    | 'obj-total-egress-throughput'
    | 'obj-total-ingress-throughput';

  /**
   * The S3 endpoint URL to which this limit applies.
   *
   */
  s3_endpoint: string;
}

export interface VolumesQuota
  extends QuotaCommonWithUsage<VolumesQuotaResourceMetric> {
  /**
   * Represents the quota type.
   */
  quota_type: 'vol-attachments' | 'vol-capacity' | 'vol-volumes';

  /**
   * The region slug to which this limit applies, if the scope is region.
   */
  region: null | string;

  /**
   * The scope of this quota.
   */
  scope: 'global' | 'region';
}

/**
 * A Quota is a service used limit that is rated based on service metrics such
 * as vCPUs used, instances or storage size.
 */
export type Quota =
  | LinodeQuota
  | LkeQuota
  | ObjectStorageEndpointQuota
  | ObjectStorageGlobalQuota
  | VolumesQuota;

/**
 * A usage limit for a given Quota based on service metrics such
 * as vCPUs, instances or storage size.
 */
export interface QuotaUsage {
  /**
   * The account-wide limit for this service, measured in units
   * specified by the `resource_metric` field.
   */
  quota_limit: number;

  /**
   * The current account usage, measured in units specified by the
   * `resource_metric` field.
   *
   * This can be null if the user does not have resources for the given Quota Name.
   */
  usage: null | number;
}

/**
 * Represents the type of service for a given quota, e.g. Linodes, Object Storage, etc.
 * The type must match the service part of the quota endpoint paths.
 */
export type QuotaServiceType = 'linode' | 'lke' | 'object-storage' | 'volumes';

/**
 * Represents the API collection name for quotas, e.g. quotas or global-quotas.
 */
export type QuotaCollection = 'global-quotas' | 'quotas';
