import {
  ObjectStorageBucket,
  ObjectStorageCluster,
  ObjectStorageKey,
  ObjectStorageObject,
} from '@linode/api-v4/lib/object-storage/types';
import * as Factory from 'factory.ts';

export const objectStorageBucketFactory = Factory.Sync.makeFactory<ObjectStorageBucket>(
  {
    cluster: 'us-east-1',
    created: '2019-12-12T00:00:00',
    hostname: Factory.each(
      (i) => `obj-bucket-${i}.us-east-1.linodeobjects.com`
    ),
    label: Factory.each((i) => `obj-bucket-${i}`),
    objects: 103,
    size: 999999,
  }
);

export const objectStorageClusterFactory = Factory.Sync.makeFactory<ObjectStorageCluster>(
  {
    domain: Factory.each((id) => `cluster-${id}.linodeobjects.com`),
    id: Factory.each((id) => `id-cgk-${id}`) as any,
    region: 'id-cgk',
    static_site_domain: Factory.each(
      (id) => `website-cluster-${id}.linodeobjects.com`
    ),
    status: 'available',
  }
);

export const objectStorageObjectFactory = Factory.Sync.makeFactory<ObjectStorageObject>(
  {
    etag: '9f254c71e28e033bf9e0e5262e3e72ab',
    last_modified: '2019-01-01T01:23:45',
    name: Factory.each((id) => `example-${id}`),
    owner: 'bfc70ab2-e3d4-42a4-ad55-83921822270c',
    size: 1024,
  }
);

export const objectStorageKeyFactory = Factory.Sync.makeFactory<ObjectStorageKey>(
  {
    access_key: '4LRW3T5FX5Z55LB3LYQ8',
    bucket_access: null,
    id: Factory.each((id) => id),
    label: Factory.each((id) => `access-key-${id}`),
    limited: false,
    secret_key: 'PYiAB02QRb53JeUge872CM6wEvBUyRhl3vHn31Ol',
  }
);

export const makeObjectsPage = (
  e: ObjectStorageObject[],
  override: { is_truncated: boolean; next_marker: null | string }
) => ({
  data: e,
  is_truncated: override.is_truncated || false,
  next_marker: override.next_marker || null,
});

export const staticObjects = objectStorageObjectFactory.buildList(250);
