import { ObjectStorageBucket } from '@linode/api-v4/lib/object-storage';

export const buckets: ObjectStorageBucket[] = [
  {
    label: 'test-bucket-001',
    created: '2019-02-20 18:46:15.516813',
    hostname: 'test-bucket-001.alpha.linodeobjects.com',
    cluster: 'us-east-1',
    size: 5418860544,
    objects: 2
  },
  {
    label: 'test-bucket-002',
    created: '2019-02-24 18:46:15.516813',
    hostname: 'test-bucket-002.alpha.linodeobjects.com',
    cluster: 'a-cluster',
    size: 1240,
    objects: 4
  }
];
