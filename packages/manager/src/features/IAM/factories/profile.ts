import type { Profile } from '@akamai/compute-ui-core/profile';

/**
 * Creates a mock Profile for use in unit tests.
 * Follows the FixtureFactory<T> pattern: plain function, no external factory library.
 */
export const createProfile = (overrides: Partial<Profile> = {}): Profile => ({
  authentication_type: 'password',
  authorized_keys: null,
  email: 'mock-user@linode.com',
  email_notifications: false,
  ip_whitelist_enabled: false,
  lish_auth_method: 'keys_only',
  referrals: {
    code: 'XXX',
    completed: 0,
    credit: 0,
    pending: 0,
    total: 0,
    url: 'https://www.linode.com/XXX',
  },
  restricted: false,
  timezone: 'America/New_York',
  two_factor_auth: false,
  uid: 9999,
  user_type: 'default',
  username: 'mock-user',
  verified_phone_number: '+15555555555',
  ...overrides,
});
