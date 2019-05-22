import { isObjectStorageEnabledForEnvironment } from 'src/constants';

export const isObjectStorageEnabled = (
  accountCapabilities: Linode.AccountCapability[]
) =>
  isObjectStorageEnabledForEnvironment ||
  accountCapabilities.indexOf('Object Storage') > -1;
