import type { Profile } from '@linode/api-v4';

export interface CompanyNameOrEmailOptions {
  company: string | undefined;
  profile: Profile | undefined;
}

/**
 * This util will determine a string displayed in the top and user menus that indicates the parent/child account that the user is viewing.
 *
 * @returns company name for parent/child/proxy users when available, email in the case of the restricted parent, or undefined for regular users
 */
export const getCompanyNameOrEmail = ({
  company,
  profile,
}: CompanyNameOrEmailOptions) => {
  // Return early if we do not need the company name or email.
  if (!profile || profile.user_type === 'default') {
    return undefined;
  }

  // For parent users lacking `account_access`: without a company name to identify an account, fall back on the email.
  // We do not need to do this for child users lacking `account_access` because we do not need to display the email.
  if (profile.user_type === 'parent' && !company) {
    return profile.email;
  }

  // In all other parent/child/proxy cases, company will be available, as it is a required field.
  return company;
};
