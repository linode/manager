import type { ChildAccount } from '@linode/api-v4';

let _counter = 1;

/**
 * Creates a mock ChildAccount for use in unit tests.
 * Follows the FixtureFactory<T> pattern: plain function, no external factory library.
 */
export const createChildAccount = (
  overrides: Partial<ChildAccount> = {}
): ChildAccount => ({
  company: `child-account-${_counter++}`,
  euuid: crypto.randomUUID(),
  ...overrides,
});

/**
 * Creates an array of mock ChildAccounts.
 */
export const createChildAccountList = (
  count: number,
  overrides: Partial<ChildAccount> = {}
): ChildAccount[] =>
  Array.from({ length: count }, () => createChildAccount(overrides));
