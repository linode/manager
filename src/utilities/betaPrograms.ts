import { isObjectStorageEnabledForEnvironment } from 'src/constants';

export const isObjectStorageEnabled = (betaPrograms: string[]) =>
  isObjectStorageEnabledForEnvironment ||
  betaPrograms.indexOf('Object Storage EAP') > -1;
