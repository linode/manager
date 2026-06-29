import type { User } from '@linode/api-v4';

let _counter = 1;

/**
 * Creates a mock User for use in unit tests.
 * Follows the FixtureFactory<T> pattern: plain function, no external factory library.
 */
export const createUser = (overrides: Partial<User> = {}): User => ({
  email: 'support@linode.com',
  last_login: null,
  password_created: null,
  restricted: true,
  ssh_keys: [],
  tfa_enabled: false,
  user_type: 'default',
  username: `user-${_counter++}`,
  verified_phone_number: null,
  ...overrides,
});

/**
 * Creates an array of mock Users.
 */
export const createUserList = (
  count: number,
  overrides: Partial<User> = {}
): User[] => Array.from({ length: count }, () => createUser(overrides));
