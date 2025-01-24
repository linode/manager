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
   * Current account usage, measured in units specified by the
   * `resource_metric` field.
   */
  used: number;

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

export type QuotaType = 'linode' | 'lke' | 'object-storage';
