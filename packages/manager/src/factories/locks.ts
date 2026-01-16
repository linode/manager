import { Factory } from '@linode/utilities';

import type { LockEntity, ResourceLock } from '@linode/api-v4';

export const lockEntityFactory = Factory.Sync.makeFactory<LockEntity>({
  id: Factory.each((i) => i + 10),
  type: 'linode',
  label: Factory.each((i) => `test-linode-${i}`),
  url: Factory.each((i) => `/v4/linode/instances/${i + 10}`),
});

export const lockFactory = Factory.Sync.makeFactory<ResourceLock>({
  id: Factory.each((i) => i),
  lock_type: 'cannot_delete',
  entity: lockEntityFactory.build(),
});
