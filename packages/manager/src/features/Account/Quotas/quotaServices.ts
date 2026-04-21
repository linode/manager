import { type Capabilities } from '@linode/api-v4';

import type {
  ObjectStorageEndpointQuota,
  Quota,
  QuotaCollection,
  QuotaServiceType,
} from '@linode/api-v4';

/**
 * Represents the different scopes that a quota can have.
 */
export type QuotaScope = 'global' | 'obj-endpoint' | 'region';

export interface ScopeValueSelectorProps {
  /**
   * An optional Capability used to filter regions applicable for the given service and scope.
   */
  regionCapability?: Capabilities;
}

/**
 * Represents the definition of a quota scope, including how to retrieve and display quotas for that scope in the UI.
 */
export interface QuotaScopeDefinition {
  /**
   * An optional function to provide filter for the API quota request for this scope.
   *
   * @param filterValue - The value to filter by, such as a region slug or Object Storage endpoint.
   *
   * @returns An object containing the filter parameters to apply to the API request for this quota scope.
   */
  apiFilterFunction?: (filterValue: string) => Partial<Quota>;

  /**
   * The name of the quota API collection that corresponds to this quota scope.
   * In most cases this will be 'quotas'.
   */
  quotaCollection: QuotaCollection;

  /**
   * An optional object specifying additional props to pass to the value selector component
   * for this quota scope, e.g. the region capabilities.
   */
  scopeValueSelectorProps?: ScopeValueSelectorProps;

  /**
   * An optional function to transform the quota data returned from the API for this scope before it is used in the UI.
   *
   * @param quota - The quota data returned from the API for this scope.
   *
   * @returns The transformed quota data to be used in the UI for this scope.
   */
  transformFunction?: (quota: Quota) => Quota;

  /**
   * An optional function to determine whether a quota should be visible in the UI for this scope.
   *
   * @param quota - The quota data returned from the API for this scope.
   *
   * @returns A boolean indicating whether the quota should be visible in the UI for this scope.
   */
  visibilityFilterFunction?: (quota: Quota) => boolean;
}

/**
 * Represents a service for which quotas are defined.
 */
export interface QuotaService {
  /**
   * A user-friendly label for the service, e.g. "Linodes" or "Object Storage".
   */
  label: string;

  /**
   * Defines the different scopes available for this service, such as global, region, or Object Storage endpoint.
   */
  scopes: Partial<Record<QuotaScope, QuotaScopeDefinition>>;

  /**
   * The type of service for this quota, e.g. 'linode', 'lke' or 'object-storage'.
   */
  type: QuotaServiceType;
}

// TODO: not used yet - add to useQuotaServices when production-ready
export const linodeQuotaService: QuotaService = {
  type: 'linode',
  label: 'Linodes',
  scopes: {
    region: {
      quotaCollection: 'quotas',
      scopeValueSelectorProps: {
        regionCapability: 'Linodes',
      },
      apiFilterFunction: (region: string) => ({ region_applied: region }),
    },
  },
};

// TODO: not used yet - add to useQuotaServices when production-ready
export const lkeQuotaService: QuotaService = {
  type: 'lke',
  label: 'Kubernetes',
  scopes: {
    region: {
      quotaCollection: 'quotas',
      scopeValueSelectorProps: {
        regionCapability: 'Kubernetes',
      },
      apiFilterFunction: (region: string) => ({ region_applied: region }),
    },
  },
};

const DISPLAYED_OBJECT_STORAGE_ENDPOINT_QUOTA_TYPES: ObjectStorageEndpointQuota['quota_type'][] =
  [
    'obj-buckets',
    'obj-bytes',
    'obj-objects',
    'obj-total-concurrent-requests',
    'obj-total-egress-throughput',
    'obj-total-ingress-throughput',
  ] as const;

export const objectStorageQuotaService = (
  objectStorageGlobalQuotasEnabled?: boolean
): QuotaService =>
  ({
    type: 'object-storage',
    label: 'Object Storage',
    scopes: {
      ...(objectStorageGlobalQuotasEnabled
        ? ({
            global: { quotaCollection: 'global-quotas' },
          } satisfies Partial<Record<QuotaScope, QuotaScopeDefinition>>)
        : {}),
      'obj-endpoint': {
        quotaCollection: 'quotas',
        apiFilterFunction: (endpoint: string) => ({ s3_endpoint: endpoint }),
        visibilityFilterFunction: (quota: Quota) =>
          DISPLAYED_OBJECT_STORAGE_ENDPOINT_QUOTA_TYPES.includes(
            (quota as ObjectStorageEndpointQuota).quota_type
          ),
        transformFunction: (quota: Quota) => ({
          ...quota,
          quota_name: quota.quota_name.replace(' (per endpoint)', ''),
        }),
      },
    },
  }) satisfies QuotaService;
