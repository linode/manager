import { ObjectStorageEndpointTypes } from 'src/object-storage';
import { Region } from 'src/regions';

/**
 * A Quota is a service used limit that is rated based on service metrics such
 * as vCPUs used, instances or storage size.
 */
export interface Quota {
  /**
   * A unique identifier for the quota.
   */
  quota_id: number;

  /**
   * Customer facing label describing the quota.
   */
  quota_name: string;

  /**
   * Longer explanatory description for the quota.
   */
  description: string;

  /**
   * The account-wide limit for this service, measured in units
   * specified by the `resource_metric` field.
   */
  quota_limit: number;

  /**
   * The unit of measurement for this service limit.
   */
  resource_metric:
    | 'instance'
    | 'CPU'
    | 'GPU'
    | 'VPU'
    | 'cluster'
    | 'node'
    | 'bucket'
    | 'object'
    | 'byte';

  /**
   * The region slug to which this limit applies.
   *
   * OBJ limits are applied by endpoint, not region.
   * This below really just is a `string` type but being verbose helps with reading comprehension.
   */
  region_applied?: Region['id'] | 'global';

  /**
   * The OBJ endpoint type to which this limit applies.
   *
   * For OBJ limits only.
   */
  endpoint_type?: ObjectStorageEndpointTypes;

  /**
   * The S3 endpoint URL to which this limit applies.
   *
   * For OBJ limits only.
   */
  s3_endpoint?: string;
}

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
  used: number | null;
}

export const quotaTypes = {
  linode: 'Linodes',
  lke: 'Kubernetes',
  'object-storage': 'Object Storage',
} as const;

export type QuotaType = keyof typeof quotaTypes;
