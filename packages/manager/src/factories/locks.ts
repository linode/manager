import { Factory } from '@linode/utilities';

import { entityFactory } from './events';

import type { ResourceLock } from '@linode/api-v4';

export const lockFactory = Factory.Sync.makeFactory<ResourceLock>({
  id: Factory.each((i) => i),
  lock_type: 'cannot_delete',
  entity: entityFactory.build({
    type: 'linode',
  }),
});
