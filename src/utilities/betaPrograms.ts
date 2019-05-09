import { isObjectStorageEnabledForEnvironment } from 'src/constants';

export const isObjectStorageEnabled = (betaPrograms: string[]) =>
  isObjectStorageEnabledForEnvironment ||
  betaPrograms.filter(eachBetaProgram =>
    /object\s?storage/i.test(eachBetaProgram)
  ).length > 0;
