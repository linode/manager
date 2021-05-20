import * as Factory from 'factory.ts';
import {
  ObjectStorageBucket,
  ObjectStorageCluster,
  ObjectStorageObject,
} from '@linode/api-v4/lib/object-storage/types';

export const objectStorageBucketFactory = Factory.Sync.makeFactory<ObjectStorageBucket>(
  {
    label: Factory.each((i) => `obj-bucket-${i}`),
    hostname: Factory.each(
      (i) => `obj-bucket-${i}.us-east-1.linodeobjects.com`
    ),
    cluster: 'us-east-1',
    created: '2019-12-12T00:00:00',
    size: 999999,
    objects: 103,
  }
);

export const objectStorageClusterFactory = Factory.Sync.makeFactory<ObjectStorageCluster>(
  {
    id: Factory.each((id) => `cluster-${id}`) as any,
    domain: Factory.each((id) => `cluster-${id}.linodeobjects.com`),
    region: 'us-east',
    static_site_domain: Factory.each(
      (id) => `website-cluster-${id}.linodeobjects.com`
    ),
    status: 'available',
  }
);

export const objectStorageObjectFactory = Factory.Sync.makeFactory<ObjectStorageObject>(
  {
    size: 1024,
    owner: 'bfc70ab2-e3d4-42a4-ad55-83921822270c',
    etag: '9f254c71e28e033bf9e0e5262e3e72ab',
    last_modified: '2019-01-01T01:23:45',
    name: Factory.each((id) => `example-${id}`),
  }
);
