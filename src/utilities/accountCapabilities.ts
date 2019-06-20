import {
  isKubernetesEnabledForEnvironment,
  isObjectStorageEnabledForEnvironment
} from 'src/constants';

export const isObjectStorageEnabled = (
  accountCapabilities: Linode.AccountCapability[]
) =>
  isObjectStorageEnabledForEnvironment ||
  accountCapabilities.indexOf('Object Storage') > -1;

export const isKubernetesEnabled = (
  accountCapabilities: Linode.AccountCapability[]
) =>
  isKubernetesEnabledForEnvironment ||
  accountCapabilities.indexOf('Kubernetes') > -1;
