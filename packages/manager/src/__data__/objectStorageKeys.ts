import type { ObjectStorageKey } from '@linode/api-v4/lib/object-storage';

export const objectStorageKey1: ObjectStorageKey = {
  access_key: '123ABC',
  bucket_access: null,
  id: 1,
  label: 'test-obj-storage-key-01',
  limited: false,
  regions: [{ id: 'us-east', s3_endpoint: 'us-east.com' }],
  secret_key: '[REDACTED]',
};

export const objectStorageKey2: ObjectStorageKey = {
  access_key: '234BCD',
  bucket_access: null,
  id: 2,
  label: 'test-obj-storage-key-02',
  limited: false,
  regions: [{ id: 'us-east', s3_endpoint: 'us-east.com' }],
  secret_key: '[REDACTED]',
};

export const objectStorageKey3: ObjectStorageKey = {
  access_key: '345CDE',
  bucket_access: null,
  id: 3,
  label: 'test-obj-storage-key-03',
  limited: false,
  regions: [{ id: 'us-east', s3_endpoint: 'us-east.com' }],
  secret_key: '[REDACTED]',
};

export default [objectStorageKey1, objectStorageKey2, objectStorageKey3];
