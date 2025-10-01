import { useProfile } from '@linode/queries';

/**
 * A simple hook to get the user type from the profile.
 *
 * UserType: 'child' | 'default' | 'parent' | 'proxy'
 */
export const useDelegationUserType = () => {
  const { data: profile } = useProfile();

  return {
    isProxyUser: Boolean(profile?.user_type === 'proxy'),
    isChildUser: Boolean(profile?.user_type === 'child'),
    isParentUser: Boolean(profile?.user_type === 'parent'),
    isDefaultUser: Boolean(profile?.user_type === 'default'),
    userType: profile?.user_type,
  };
};
