import { useGrants, useProfile } from 'src/queries/profile/profile';

import type { RestrictedGlobalGrantType } from 'src/features/Account/utils';

/**
 * Determine whether the user has restricted access to a specific resource.
 *
 * @example
 * // If account access does not equal 'read_write', the user has restricted access.
 * useRestrictedGlobalGrantCheck({
 *   globalGrantType: 'account_access',
 *   permittedGrantLevel: 'read_write',
 * });
 * // Returns: true
 */
export const useRestrictedGlobalGrantCheck = ({
  globalGrantType,
  permittedGrantLevel,
}: RestrictedGlobalGrantType): boolean => {
  const { data: grants } = useGrants();
  const { data: profile } = useProfile();

  if (globalGrantType !== 'account_access') {
    return Boolean(profile?.restricted) && !grants?.global?.[globalGrantType];
  }

  return (
    Boolean(profile?.restricted) &&
    grants?.global?.[globalGrantType] !== permittedGrantLevel
  );
};
