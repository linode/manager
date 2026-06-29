import type { AccountEntity, EntityType } from '@linode/api-v4';

export const possibleEntityTypes: EntityType[] = [
  'database',
  'domain',
  'firewall',
  'image',
  'linode',
  'longview',
  'nodebalancer',
  'stackscript',
  'volume',
  'vpc',
];

let _counter = 1;

/**
 * Creates a mock AccountEntity for use in unit tests.
 * Follows the FixtureFactory<T> pattern: plain function, no external factory library.
 */
export const createAccountEntity = (
  overrides: Partial<AccountEntity> = {}
): AccountEntity => {
  const i = _counter++;
  return {
    id: i,
    label: `test-${i}`,
    type: possibleEntityTypes[(i - 1) % possibleEntityTypes.length],
    ...overrides,
  };
};

/**
 * Creates an array of mock AccountEntities.
 */
export const createAccountEntityList = (
  count: number,
  overrides: Partial<AccountEntity> = {}
): AccountEntity[] =>
  Array.from({ length: count }, () => createAccountEntity(overrides));
