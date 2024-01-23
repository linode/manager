import type { GrantTypeMap } from 'src/features/Account/types';

export const getRestrictedResourceText = (resourceType: GrantTypeMap) => {
  return `Access restricted for ${resourceType}. Please contact your account administrator to request the necessary permissions.`;
};
