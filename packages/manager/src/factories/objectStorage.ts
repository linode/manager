import * as Factory from 'factory.ts';
import {
  ObjectStorageBucket,
  ObjectStorageCluster
} from '@linode/api-v4/lib/object-storage/types';

export const objectStorageBucketFactory = Factory.Sync.makeFactory<
  ObjectStorageBucket
>({
  label: Factory.each(i => `obj-bucket-${i}`),
  hostname: Factory.each(i => `obj-bucket-${i}.us-east-1.linodeobjects.com`),
  cluster: 'us-east-1',
  created: '2019-12-12T00:00:00',
  size: 999999,
  objects: 103
});

export const objectStorageClusterFactory = Factory.Sync.makeFactory<
  ObjectStorageCluster
>({
  id: Factory.each(id => `cluster-${id}`) as any,
  domain: Factory.each(id => `cluster-${id}.linodeobjects.com`),
  region: Factory.each(id => `region-${id}`),
  static_site_domain: Factory.each(
    id => `website-cluster-${id}.linodeobjects.com`
  ),
  status: 'available'
});
