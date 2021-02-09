import { ObjectStorageBucket } from '@linode/api-v4/lib/object-storage';

export const buckets: ObjectStorageBucket[] = [
  {
    label: 'test-bucket-001',
    created: '2017-12-11T16:35:31',
    hostname: 'test-bucket-001.alpha.linodeobjects.com',
    cluster: 'us-east-1',
    size: 5418860544,
    objects: 2
  },
  {
    label: 'test-bucket-002',
    created: '2017-12-11T16:35:31',
    hostname: 'test-bucket-002.alpha.linodeobjects.com',
    cluster: 'a-cluster',
    size: 1240,
    objects: 4
  }
];
