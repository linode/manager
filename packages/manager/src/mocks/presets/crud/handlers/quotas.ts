import { regions } from '@linode/utilities';
import { http } from 'msw';

import { objectStorageEndpointsFactory } from 'src/factories/objectStorage';
import { linodeQuotaFactory, lkeQuotaFactory } from 'src/factories/quotas';
import {
  makeNotFoundResponse,
  makePaginatedResponse,
  makeResponse,
} from 'src/mocks/utilities/response';

import type {
  LinodeQuota,
  LkeQuota,
  ObjectStorageEndpoint,
  ObjectStorageEndpointQuota,
  Quota,
  QuotaServiceType,
  QuotaUsage,
  VolumesQuota,
} from '@linode/api-v4';
import type { StrictResponse } from 'msw';
import type {
  APIErrorResponse,
  APIPaginatedResponse,
} from 'src/mocks/utilities/response';

const mockS3Endpoints = [
  objectStorageEndpointsFactory.build({
    endpoint_type: 'E0',
    region: 'us-east',
    s3_endpoint: 'us-east-1.linodeobjects.com',
  }),
  objectStorageEndpointsFactory.build({
    endpoint_type: 'E0',
    region: 'us-west',
    s3_endpoint: 'us-west-1.linodeobjects.com',
  }),
  objectStorageEndpointsFactory.build({
    endpoint_type: 'E3',
    region: 'br-gru',
    s3_endpoint: 'br-gru-1.linodeobjects.com',
  }),
];

const blockStorageRegions = regions.filter((region) =>
  region.capabilities.includes('Block Storage')
);

const mockQuotas: Record<QuotaServiceType, Record<string, Quota[]>> = {
  linode: {
    quotas: [
      ...regions.map(
        (region): LinodeQuota =>
          linodeQuotaFactory.build({
            description:
              'Max number of vCPUs assigned to Linodes with Dedicated plans',
            quota_limit: 50,
            quota_name: 'Dedicated CPU',
            region_applied: region.id,
            resource_metric: 'CPU',
          })
      ),
      ...regions.map(
        (region): LinodeQuota =>
          linodeQuotaFactory.build({
            description:
              'Max number of vCPUs assigned to Linodes with Shared plans',
            quota_limit: 100,
            quota_name: 'Shared CPU',
            region_applied: region.id,
            resource_metric: 'CPU',
          })
      ),
      ...regions.map(
        (region): LinodeQuota =>
          linodeQuotaFactory.build({
            description:
              'Max number of GPUs assigned to Linodes with GPU plans',
            quota_limit: 25,
            quota_name: 'GPU',
            region_applied: region.id,
            resource_metric: 'GPU',
          })
      ),
      ...regions.map(
        (region): LinodeQuota =>
          linodeQuotaFactory.build({
            description:
              'Max number of VPUs assigned to Linodes with VPU plans',
            quota_limit: 10,
            quota_name: 'VPU',
            region_applied: region.id,
            resource_metric: 'VPU',
          })
      ),
      ...regions.map(
        (region): LinodeQuota =>
          linodeQuotaFactory.build({
            description:
              'Max number of vCPUs assigned to Linodes with High Memory plans',
            quota_limit: 15,
            quota_name: 'High Memory',
            region_applied: region.id,
            resource_metric: 'CPU',
          })
      ),
    ],
  },
  lke: {
    quotas: [
      ...regions.map(
        (region): LkeQuota =>
          lkeQuotaFactory.build({
            quota_limit: 50,
            quota_name: 'Total number of Clusters',
            region_applied: region.id,
            resource_metric: 'cluster',
          })
      ),
    ],
  },
  'object-storage': {
    'global-quotas': [
      {
        quota_id: 'keys',
        quota_name: 'Number of Access Keys',
        quota_type: 'keys',
        description: 'Current number of access keys per account',
        quota_limit: 100,
        resource_metric: 'key',
        has_usage: true,
      },
    ],
    quotas: [
      ...mockS3Endpoints.map(
        (obj_endpoint): ObjectStorageEndpointQuota => ({
          quota_id: `obj-bytes-${obj_endpoint.s3_endpoint}`,
          quota_type: 'obj-bytes',
          description: 'The total capacity of your Object Storage account',
          quota_limit:
            obj_endpoint.endpoint_type === 'E3'
              ? 549755813888000
              : 109951162777600,
          quota_name: 'Total Capacity',
          resource_metric: 'byte',
          endpoint_type: obj_endpoint.endpoint_type,
          s3_endpoint: obj_endpoint.s3_endpoint!,
          has_usage: true,
        })
      ),
      ...mockS3Endpoints.map(
        (obj_endpoint): ObjectStorageEndpointQuota => ({
          quota_id: `obj-buckets-${obj_endpoint.s3_endpoint}`,
          quota_type: 'obj-buckets',
          description:
            'The allowed number of buckets in your Object Storage account',
          quota_limit: 1000,
          quota_name: 'Number of Buckets',
          resource_metric: 'bucket',
          endpoint_type: obj_endpoint.endpoint_type,
          s3_endpoint: obj_endpoint.s3_endpoint!,
          has_usage: true,
        })
      ),
      ...mockS3Endpoints.map(
        (obj_endpoint): ObjectStorageEndpointQuota => ({
          quota_id: `obj-objects-${obj_endpoint.s3_endpoint}`,
          quota_type: 'obj-objects',
          description:
            'The total number of objects in your Object Storage account',
          quota_limit:
            obj_endpoint.endpoint_type === 'E3' ? 500_000_000 : 100_000_000,
          quota_name: 'Number of Objects',
          resource_metric: 'object',
          endpoint_type: obj_endpoint.endpoint_type,
          s3_endpoint: obj_endpoint.s3_endpoint!,
          has_usage: true,
        })
      ),
    ],
  },
  volumes: {
    quotas: [
      {
        quota_id: 'vol-capacity-global',
        quota_type: 'vol-capacity',
        quota_name: 'Block Storage Capacity',
        description: 'Maximum storage capacity across all regions',
        quota_limit: 102400,
        resource_metric: 'gigabyte',
        scope: 'global',
        region: null,
        has_usage: true,
      },
      ...blockStorageRegions.map(
        (region): VolumesQuota => ({
          quota_id: `vol-capacity-${region.id}`,
          description: `Maximum storage capacity in ${region.id} region`,
          quota_limit: 51200,
          quota_name: 'Block Storage Capacity',
          quota_type: 'vol-capacity',
          resource_metric: 'gigabyte',
          scope: 'region',
          region: region.id,
          has_usage: true,
        })
      ),
      ...blockStorageRegions.map(
        (region): VolumesQuota => ({
          quota_id: `vol-volumes-${region.id}`,
          quota_type: 'vol-volumes',
          quota_name: `Block Storage Volume Count`,
          description: `Maximum number of volumes in ${region.id} region`,
          quota_limit: 50,
          resource_metric: 'volume',
          scope: 'region',
          region: region.id,
          has_usage: true,
        })
      ),
      ...blockStorageRegions.map((region) => ({
        quota_id: `vol-attachments-${region.id}`,
        quota_type: 'vol-attachments' as VolumesQuota['quota_type'],
        quota_name: 'Block Storage Attachment Count',
        description: `Maximum number of concurrent volume attachments in ${region.id} region`,
        quota_limit: 400,
        resource_metric: 'attachment' as VolumesQuota['resource_metric'],
        scope: 'region' as VolumesQuota['scope'],
        region: region.id,
        has_usage: true,
      })),
    ],
  },
};

const getMockQuotas = (
  service: QuotaServiceType,
  collection: string
): Quota[] => {
  return mockQuotas[service as QuotaServiceType]?.[collection];
};

export const getS3Endpoint = () => [
  http.get(
    '*/v4*/object-storage/endpoints',
    async ({
      request,
    }): Promise<
      StrictResponse<
        APIErrorResponse | APIPaginatedResponse<ObjectStorageEndpoint>
      >
    > => {
      return makePaginatedResponse({
        data: mockS3Endpoints,
        request,
      });
    }
  ),
];

export const getQuotas = () => [
  http.get(
    '*/v4*/:service/:collection/:id/usage',
    async ({
      params,
    }): Promise<StrictResponse<APIErrorResponse | QuotaUsage>> => {
      const quota = getMockQuotas(
        params.service as QuotaServiceType,
        params.collection as string
      )?.find(({ quota_id }) => quota_id === params.id);

      if (!quota) {
        return makeNotFoundResponse();
      }

      return makeResponse({
        quota_limit: quota.quota_limit,
        usage: Math.floor(Math.random() * quota.quota_limit),
      });
    }
  ),
  http.get(
    '*/v4*/:service/:collection/:id',
    async ({ params }): Promise<StrictResponse<APIErrorResponse | Quota>> => {
      const quota = getMockQuotas(
        params.service as QuotaServiceType,
        params.collection as string
      )?.find(({ quota_id }) => quota_id === params.id);

      if (!quota) {
        return makeNotFoundResponse();
      }

      return makeResponse(quota);
    }
  ),
  http.get(
    '*/v4*/:service/:collection',
    async ({
      params,
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<Quota>>
    > => {
      let data = getMockQuotas(
        params.service as QuotaServiceType,
        params.collection as string
      );
      if (!data) {
        return makeNotFoundResponse();
      }

      const xFilters = request.headers.get('X-Filter');
      const filters: Record<string, any> = xFilters ? JSON.parse(xFilters) : {};
      const filterKeys = Object.keys(filters);

      if (filterKeys.length > 0) {
        data = data.filter((quota) =>
          filterKeys.every((key) => {
            const filterVal = filters[key];
            const quotaVal = (quota as Record<string, any>)[key];
            return filterVal === quotaVal;
          })
        );
      }

      return makePaginatedResponse({
        data,
        request,
      });
    }
  ),
];
