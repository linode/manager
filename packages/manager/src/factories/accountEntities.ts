import { Factory } from '@linode/utilities';

import type { AccountEntity, EntityType } from '@linode/api-v4';

export const possibleTypes: EntityType[] = [
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

export const accountEntityFactory = Factory.Sync.makeFactory<AccountEntity>({
  id: Factory.each((i) => i),
  label: Factory.each((i) => `test-${i}`),
  type: Factory.each((i) => possibleTypes[i % possibleTypes.length]),
});
