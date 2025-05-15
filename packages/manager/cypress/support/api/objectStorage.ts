import {
  deleteBucket,
  getBucketsInRegion,
  getObjectList,
  getObjectStorageEndpoints,
  getObjectStorageKeys,
  getObjectURL,
  revokeObjectStorageKey,
} from '@linode/api-v4/lib/object-storage';
import axios from 'axios';
import { authenticate } from 'support/api/authentication';
import { isTestLabel } from 'support/api/common';
import { depaginate } from 'support/util/paginate';

import type {
  ObjectStorageBucket,
  ObjectStorageEndpoint,
  ObjectStorageKey,
  ObjectStorageObject,
} from '@linode/api-v4';

/**
 * Asynchronously deletes all objects within a test bucket.
 *
 * If the given bucket is not a test bucket (in other words, its label does not
 * begin with `cy-test-`), the promise will reject.
 *
 * @param clusterId - ID of cluster for test bucket.
 * @param bucketLabel - Label for test bucket.
 *
 * @returns Promise that resolves when all test bucket objects are deleted.
 */
export const deleteAllTestBucketObjects = async (
  clusterId: string,
  bucketLabel: string
) => {
  if (!isTestLabel(bucketLabel)) {
    throw new Error(
      `Attempted to delete objects belonging to a non-test Object Storage bucket '${bucketLabel}'.`
    );
  }

  authenticate();
  // @TODO Improve object retrieval to account for pagination for buckets with many objects.
  const storageObjects = await getObjectList({
    bucket: bucketLabel,
    clusterId,
  });
  const storageObjectDeletePromises = storageObjects.data.map(
    async (storageObject: ObjectStorageObject) => {
      const objectUrl = await getObjectURL(
        clusterId,
        bucketLabel,
        storageObject.name,
        'DELETE'
      );
      await axios.delete(objectUrl.url);
    }
  );

  return Promise.all(storageObjectDeletePromises);
};

/**
 * Asynchronously deletes all test buckets.
 *
 * If a test bucket has any objects, they will all be deleted prior to deleting
 * the bucket.
 *
 * @returns Promise that resolves when all test buckets are deleted.
 */
export const deleteAllTestBuckets = async () => {
  authenticate();
  const objEndpoints = await depaginate<ObjectStorageEndpoint>((page) =>
    getObjectStorageEndpoints({ params: { page } })
  );
  const buckets = (
    await Promise.all(
      objEndpoints.map(async (endpoint) => {
        try {
          return depaginate<ObjectStorageBucket>((page) =>
            getBucketsInRegion(endpoint.region, { page })
          );
        } catch (e) {
          console.error(
            `Failed to fetch buckets from Object Storage endpoint in '${endpoint.region}'`
          );
          if (e && e.message) {
            console.error(e.message);
            console.error(e);
          }
          return [];
        }
      })
    )
  )
    .flat()
    .filter((bucket) => isTestLabel(bucket.label));

  const deleteBucketsPromises = buckets.map(
    async (bucket: ObjectStorageBucket) => {
      await deleteAllTestBucketObjects(bucket.cluster, bucket.label);
      return deleteBucket({
        cluster: bucket.cluster,
        label: bucket.label,
      });
    }
  );

  await Promise.all(deleteBucketsPromises);
  return;
};

/**
 * Asynchronously deletes all test access keys.
 *
 * A test access key is one whose label begins with `cy-test-`.
 *
 * @returns Promise that resolves when all test access keys are deleted.
 */
export const deleteAllTestAccessKeys = async (): Promise<void> => {
  authenticate();
  const getAccessKeysPage = (page: number) => getObjectStorageKeys({ page });

  // Get all access keys that begin with `cy-test`.
  const accessKeys: ObjectStorageKey[] = (
    await depaginate<ObjectStorageKey>(getAccessKeysPage)
  ).filter((accessKey: ObjectStorageKey) => {
    return isTestLabel(accessKey.label);
  });

  // Get an array of promises to revoke each access key.
  const revokeAccessKeysPromises = accessKeys.map(
    (accessKey: ObjectStorageKey) => {
      return revokeObjectStorageKey(accessKey.id);
    }
  );

  await Promise.all(revokeAccessKeysPromises);
  return;
};
