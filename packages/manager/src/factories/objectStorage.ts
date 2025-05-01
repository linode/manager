import { Factory } from '@linode/utilities';

import type {
  CreateObjectStorageBucketPayload,
  ObjectStorageBucket,
  ObjectStorageCluster,
  ObjectStorageEndpoint,
  ObjectStorageKey,
  ObjectStorageObject,
} from '@linode/api-v4/lib/object-storage/types';

export const objectStorageBucketFactory =
  Factory.Sync.makeFactory<ObjectStorageBucket>({
    cluster: 'us-east-1',
    created: '2019-12-12T00:00:00',
    hostname: Factory.each(
      (i) => `obj-bucket-${i}.us-east-1.linodeobjects.com`
    ),
    label: Factory.each((i) => `obj-bucket-${i}`),
    objects: 103,
    region: 'us-east',
    size: 999999,
  });

// TODO: OBJ Gen2 - Once we eliminate legacy and Gen1 support, we can rename this to `objectStorageBucketFactory` and set it as the default.
export const objectStorageBucketFactoryGen2 =
  Factory.Sync.makeFactory<ObjectStorageBucket>({
    cluster: 'us-iad-12',
    created: '2019-12-12T00:00:00',
    endpoint_type: 'E3',
    hostname: Factory.each(
      (i) => `obj-bucket-${i}.us-iad-12.linodeobjects.com`
    ),
    label: Factory.each((i) => `obj-bucket-${i}`),
    objects: 103,
    region: 'us-iad',
    s3_endpoint: 'us-iad-12.linodeobjects.com',
    size: 999999,
  });

export const createObjectStorageBucketFactoryLegacy =
  Factory.Sync.makeFactory<CreateObjectStorageBucketPayload>({
    acl: 'private',
    cluster: 'us-east-1',
    cors_enabled: true,
    label: Factory.each((i) => `obj-bucket-${i}`),
  });

export const createObjectStorageBucketFactoryGen1 =
  Factory.Sync.makeFactory<CreateObjectStorageBucketPayload>({
    acl: 'private',
    cors_enabled: true,
    label: Factory.each((i) => `obj-bucket-${i}`),
    region: 'us-east-1',
  });

// TODO: OBJ Gen2 - Once we eliminate legacy and Gen1 support, we can rename this to `createObjectStorageBucketFactory` and set it as the default.
export const createObjectStorageBucketFactoryGen2 =
  Factory.Sync.makeFactory<CreateObjectStorageBucketPayload>({
    acl: 'private',
    cors_enabled: false,
    endpoint_type: 'E1',
    label: Factory.each((i) => `obj-bucket-${i}`),
    region: 'us-east',
  });

export const objectStorageClusterFactory =
  Factory.Sync.makeFactory<ObjectStorageCluster>({
    domain: Factory.each((id) => `cluster-${id}.linodeobjects.com`),
    id: Factory.each((id) => `cluster-${id}`) as any,
    region: 'us-east',
    static_site_domain: Factory.each(
      (id) => `website-cluster-${id}.linodeobjects.com`
    ),
    status: 'available',
  });

export const objectStorageObjectFactory =
  Factory.Sync.makeFactory<ObjectStorageObject>({
    etag: '9f254c71e28e033bf9e0e5262e3e72ab',
    last_modified: '2019-01-01T01:23:45',
    name: Factory.each((id) => `example-${id}`),
    owner: 'bfc70ab2-e3d4-42a4-ad55-83921822270c',
    size: 1024,
  });

export const objectStorageKeyFactory =
  Factory.Sync.makeFactory<ObjectStorageKey>({
    access_key: '4LRW3T5FX5Z55LB3LYQ8',
    bucket_access: null,
    id: Factory.each((id) => id),
    label: Factory.each((id) => `access-key-${id}`),
    limited: false,
    regions: [{ id: 'us-east', s3_endpoint: 'us-east.com' }],
    secret_key: 'PYiAB02QRb53JeUge872CM6wEvBUyRhl3vHn31Ol',
  });

// TODO: OBJ Gen2 - Once we eliminate legacy and Gen1 support, we can rename this to `objectStorageKeyFactory` and set it as the default.
export const objectStorageKeyFactoryGen2 =
  Factory.Sync.makeFactory<ObjectStorageKey>({
    access_key: '4LRW3T5FX5Z55LB3LYQ8',
    bucket_access: null,
    id: Factory.each((id) => id),
    label: Factory.each((id) => `access-key-${id}`),
    limited: false,
    regions: [
      { endpoint_type: 'E1', id: 'us-east', s3_endpoint: 'us-east.com' },
    ],
    secret_key: 'PYiAB02QRb53JeUge872CM6wEvBUyRhl3vHn31Ol',
  });

export const makeObjectsPage = (
  e: ObjectStorageObject[],
  override: { is_truncated: boolean; next_marker: null | string }
) => ({
  data: e,
  is_truncated: override.is_truncated || false,
  next_marker: override.next_marker || null,
});

export const staticObjects = objectStorageObjectFactory.buildList(250);

export const objectStorageEndpointsFactory =
  Factory.Sync.makeFactory<ObjectStorageEndpoint>({
    endpoint_type: 'E2',
    region: 'us-east',
    s3_endpoint: 'us-east-1.linodeobjects.com',
  });
