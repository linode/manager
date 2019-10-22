import { Bucket } from 'linode-js-sdk/lib/object-storage';

export const buckets: Bucket[] = [
  {
    label: 'test-bucket-001',
    created: '2019-02-20 18:46:15.516813',
    hostname: 'test-bucket-001.alpha.linodeobjects.com',
    cluster: 'a-cluster',
    objects: 1,
    size: 1,
    region: ''
  },
  {
    label: 'test-bucket-002',
    created: '2019-02-24 18:46:15.516813',
    hostname: 'test-bucket-002.alpha.linodeobjects.com',
    cluster: 'a-cluster',
    objects: 1,
    size: 1,
    region: ''
  }
];
