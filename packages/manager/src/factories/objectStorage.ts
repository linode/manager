import { Factory } from '@linode/utilities';

import type {
  ObjectStorageBucket,
  ObjectStorageEndpoint,
  ObjectStorageKey,
  ObjectStorageObject,
} from '@linode/api-v4/lib/object-storage/types';

type ObjectStorageBucketFactoryOptions = Pick<
  Required<ObjectStorageBucket>,
  'endpoint_type' | 'objects' | 'region' | 'size'
> & {
  actualCluster: string;
  returnedCluster?: string;
};

const makeStorageBucketFactory = (options: ObjectStorageBucketFactoryOptions) =>
  Factory.Sync.makeFactory<ObjectStorageBucket>({
    hostname: Factory.each(
      (i) => `obj-bucket-${i}.${options.actualCluster}.linodeobjects.com`
    ),
    label: Factory.each((i) => `obj-bucket-${i}`),
    created: '2019-12-12T00:00:00',
    region: options.region,
    cluster: options.returnedCluster ?? options.actualCluster,
    endpoint_type: options.endpoint_type,
    s3_endpoint: `${options.actualCluster}.linodeobjects.com`,
    objects: options.objects,
    size: options.size,
  });

export const objectStorageBucketFactory = makeStorageBucketFactory({
  actualCluster: 'us-east-1',
  endpoint_type: 'E1',
  region: 'us-east',
  objects: 103,
  size: 999999,
});

// TODO: OBJ Gen2 - Once we eliminate legacy and Gen1 support, we can rename this to `objectStorageBucketFactory` and set it as the default.
export const objectStorageBucketFactoryGen2 = makeStorageBucketFactory({
  actualCluster: 'us-iad-12',
  returnedCluster: '',
  endpoint_type: 'E3',
  region: 'us-iad',
  objects: 103,
  size: 999999,
});

export const createObjectStorageBucketFactoryGen1 = makeStorageBucketFactory({
  actualCluster: 'us-east-1',
  endpoint_type: 'E1',
  region: 'us-east',
  objects: 0,
  size: 0,
});

// TODO: OBJ Gen2 - Once we eliminate legacy and Gen1 support, we can rename this to `createObjectStorageBucketFactory` and set it as the default.
export const createObjectStorageBucketFactoryGen2 = makeStorageBucketFactory({
  actualCluster: 'us-iad-12',
  returnedCluster: '',
  endpoint_type: 'E3',
  region: 'us-iad',
  objects: 0,
  size: 0,
});

export const objectStorageObjectFactory =
  Factory.Sync.makeFactory<ObjectStorageObject>({
    etag: '9f254c71e28e033bf9e0e5262e3e72ab',
    last_modified: '2019-01-01T01:23:45',
    name: Factory.each((id) => `example-${id}`),
    owner: 'bfc70ab2-e3d4-42a4-ad55-83921822270c',
    size: 1024,
  });

// Generate fake access_key and secret_key on the fly.
export const objectStorageKeyFactory =
  Factory.Sync.makeFactory<ObjectStorageKey>({
    access_key: Factory.each((id) => `FAKeACCeSsKEy${id}`),
    bucket_access: null,
    id: Factory.each((id) => id),
    label: Factory.each((id) => `access-key-${id}`),
    limited: false,
    regions: [{ id: 'us-east', s3_endpoint: 'us-east.com' }],
    secret_key: Factory.each((id) => `FAkeSECretkEY${id}`),
  });

// TODO: OBJ Gen2 - Once we eliminate legacy and Gen1 support, we can rename this to `objectStorageKeyFactory` and set it as the default.
// Generate fake access_key and secret_key on the fly.
export const objectStorageKeyFactoryGen2 =
  Factory.Sync.makeFactory<ObjectStorageKey>({
    access_key: Factory.each((id) => `FAKeACCeSsKEy${id}`),
    bucket_access: null,
    id: Factory.each((id) => id),
    label: Factory.each((id) => `access-key-${id}`),
    limited: false,
    regions: [
      { endpoint_type: 'E1', id: 'us-east', s3_endpoint: 'us-east.com' },
    ],
    secret_key: Factory.each((id) => `FAkeSECretkEY${id}`),
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
