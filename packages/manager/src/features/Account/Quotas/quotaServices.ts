import { type Capabilities } from '@linode/api-v4';

import type {
  LinodeQuota,
  LkeQuota,
  ObjectStorageEndpointQuota,
  Quota,
  QuotaCollection,
  QuotaServiceType,
  VolumesQuota,
} from '@linode/api-v4';

/**
 * Represents the different scopes that a quota can have.
 */
export type QuotaScope = 'global' | 'obj-endpoint' | 'region';

/**
 * Type of the scope value
 */
export type ScopeValueType = null | string;

export interface ScopeValueSelectorProps {
  /**
   * An optional Capability used to filter regions applicable for the given service and scope.
   */
  regionCapability?: Capabilities;
}

/**
 * Represents the definition of a quota scope, including how to retrieve and display quotas for that scope in the UI.
 */
export interface QuotaScopeDefinition<Q extends Quota = Quota> {
  /**
   * An optional function to provide filter for the API quota request for this scope.
   *
   * @param scopeValue - The value of the scope, such as a region slug or Object Storage endpoint.
   *
   * @returns An object containing the filter parameters to apply to the API request for this quota scope.
   */
  apiFilterFunction?: (scopeValue: ScopeValueType) => Partial<Q>;

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
  transformFunction?: (quota: Q) => Q;

  /**
   * An optional function to determine whether a quota should be visible in the UI for this scope.
   *
   * @param quota - The quota data returned from the API for this scope.
   *
   * @returns A boolean indicating whether the quota should be visible in the UI for this scope.
   */
  visibilityFilterFunction?: (quota: Q) => boolean;
}

/**
 * Represents a service for which quotas are defined.
 */
export interface QuotaService<Q extends Quota = Quota> {
  /**
   * A user-friendly label for the service, e.g. "Linodes" or "Object Storage".
   */
  label: string;

  /**
   * Defines the different scopes available for this service, such as global, region, or Object Storage endpoint.
   */
  scopes: Partial<Record<QuotaScope, QuotaScopeDefinition<Q>>>;

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
      apiFilterFunction: (
        scopeValue: ScopeValueType
      ): Partial<LinodeQuota> => ({
        region_applied: scopeValue,
      }),
    },
  },
} satisfies QuotaService<LinodeQuota>;

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
      apiFilterFunction: (scopeValue: ScopeValueType): Partial<LkeQuota> => ({
        region_applied: scopeValue,
      }),
    },
  },
} satisfies QuotaService<LkeQuota>;

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
        ? {
            global: { quotaCollection: 'global-quotas' },
          }
        : {}),
      'obj-endpoint': {
        quotaCollection: 'quotas',
        apiFilterFunction: (
          scopeValue: ScopeValueType
        ): Partial<ObjectStorageEndpointQuota> => ({
          s3_endpoint: scopeValue!,
        }),
        visibilityFilterFunction: (quota: ObjectStorageEndpointQuota) =>
          DISPLAYED_OBJECT_STORAGE_ENDPOINT_QUOTA_TYPES.includes(
            quota.quota_type
          ),
        transformFunction: (
          quota: ObjectStorageEndpointQuota
        ): ObjectStorageEndpointQuota => ({
          ...quota,
          quota_name: quota.quota_name.replace(' (per endpoint)', ''),
        }),
      } satisfies QuotaScopeDefinition<ObjectStorageEndpointQuota>,
    },
  }) satisfies QuotaService;

const VOLUMES_QUOTA_NAMES = new Map<string, string>([
  ['vol-attachments|region', 'Attachment Count'],
  ['vol-capacity|global', 'Global Storage Capacity'],
  ['vol-capacity|region', 'Regional Storage Capacity'],
  ['vol-volumes|region', 'Volume Count'],
]);

const volumeQuotaTransformFunction = (quota: VolumesQuota): VolumesQuota => {
  return {
    ...quota,
    quota_name:
      VOLUMES_QUOTA_NAMES.get(`${quota.quota_type}|${quota.scope}`) ??
      quota.quota_name,
  };
};

export const volumesQuotaService: QuotaService = {
  type: 'volumes',
  label: 'Volumes',
  scopes: {
    global: {
      quotaCollection: 'quotas',
      apiFilterFunction: (_: ScopeValueType): Partial<VolumesQuota> => ({
        scope: 'global',
      }),
      transformFunction: volumeQuotaTransformFunction,
    },
    region: {
      quotaCollection: 'quotas',
      scopeValueSelectorProps: {
        regionCapability: 'Block Storage',
      },
      apiFilterFunction: (
        scopeValue: ScopeValueType
      ): Partial<VolumesQuota> => ({
        region: scopeValue,
      }),
      transformFunction: volumeQuotaTransformFunction,
    },
  },
} satisfies QuotaService<VolumesQuota>;
