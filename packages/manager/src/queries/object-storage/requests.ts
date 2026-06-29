import {
  getBucketsInRegion,
  getObjectStorageEndpoints,
  getObjectStorageTypes,
} from '@linode/api-v4';
import { getAll } from '@linode/utilities';

import type { PriceType } from '@akamai/compute-ui-core/api';
import type {
  APIError,
  ObjectStorageBucket,
  ObjectStorageEndpoint,
} from '@linode/api-v4';

export const getAllObjectStorageTypes = () =>
  getAll<PriceType>((params) => getObjectStorageTypes(params))().then(
    (data) => data.data
  );

export const getAllObjectStorageEndpoints = () =>
  getAll<ObjectStorageEndpoint>((params, filter) =>
    getObjectStorageEndpoints({ filter, params })
  )().then((data) => data.data);

export const getAllBucketsInRegion = (
  regionId: string
): Promise<ObjectStorageBucket[]> =>
  getAll<ObjectStorageBucket>((params, filter) =>
    getBucketsInRegion(regionId, params, filter)
  )().then((data) => data.data);

export interface BucketsResponse {
  buckets: ObjectStorageBucket[];
  errors: APIError[];
}

/**
 * We had to change the signature of things slightly since we're using the `object-storage/endpoints`
 * endpoint. Note that the server response always includes information for all regions.
 * @param endpoints - The list of Object Storage endpoints to fetch buckets for.
 * @note This will be the preferred way to get all buckets once fetching by clusters is deprecated and Gen2 is in GA.
 * @deprecated This function is deprecated and will be removed in the future. Please use `useObjectStorageBuckets`
 * hook or `useObjectStorageBucketsByRegions` hook instead to fetch bucket list
 */
export const getAllBucketsFromEndpoints = async (
  endpoints: ObjectStorageEndpoint[] | undefined
): Promise<BucketsResponse> => {
  if (!endpoints?.length) {
    return { buckets: [], errors: [] };
  }

  const regionIds = Array.from(
    new Set(
      endpoints
        .filter((endpoint) => endpoint.s3_endpoint !== null)
        .map((e) => e.region)
    )
  );
  const results: BucketsResponse[] = await Promise.all(
    regionIds.map((regionId) =>
      getAll<ObjectStorageBucket>((params) =>
        getBucketsInRegion(regionId, params)
      )()
        .then((data) => ({
          buckets: data.data,
          errors: [],
        }))
        .catch((errors: APIError[]) => ({
          buckets: [],
          errors,
        }))
    )
  );

  const buckets = results.flatMap((result) => result.buckets);
  const errors = results.flatMap((result) => result.errors);

  return { buckets, errors };
};
