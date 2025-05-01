import type { ObjectStorageBucket } from '@linode/api-v4/lib/object-storage';

export const buckets: ObjectStorageBucket[] = [
  {
    cluster: 'us-east-1',
    created: '2017-12-11T16:35:31',
    hostname: 'test-bucket-001.alpha.linodeobjects.com',
    label: 'test-bucket-001',
    objects: 2,
    region: 'us-east',
    size: 5418860544,
  },
  {
    cluster: 'a-cluster',
    created: '2017-12-11T16:35:31',
    hostname: 'test-bucket-002.alpha.linodeobjects.com',
    label: 'test-bucket-002',
    objects: 4,
    region: 'us-east',
    size: 1240,
  },
];
