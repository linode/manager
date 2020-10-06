import { ObjectStorageKey } from '@linode/api-v4/lib/object-storage';

export const objectStorageKey1: ObjectStorageKey = {
  id: 1,
  label: 'test-obj-storage-key-01',
  access_key: '123ABC',
  secret_key: '[REDACTED]',
  limited: false,
  bucket_access: null
};

export const objectStorageKey2: ObjectStorageKey = {
  id: 2,
  label: 'test-obj-storage-key-02',
  access_key: '234BCD',
  secret_key: '[REDACTED]',
  limited: false,
  bucket_access: null
};

export const objectStorageKey3: ObjectStorageKey = {
  id: 3,
  label: 'test-obj-storage-key-03',
  access_key: '345CDE',
  secret_key: '[REDACTED]',
  limited: false,
  bucket_access: null
};

export default [objectStorageKey1, objectStorageKey2, objectStorageKey3];
