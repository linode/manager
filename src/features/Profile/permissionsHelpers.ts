import { pathOr } from 'ramda';

export const isRestrictedUser = (state: any) => {
  return pathOr(false, ['__resources', 'profile', 'data', 'restricted'], state);
};

export const hasGrant = (state: any, grant: string) => {
  return pathOr(
    false,
    ['__resources', 'profile', 'data', 'grants', 'global', grant],
    state
  );
};
