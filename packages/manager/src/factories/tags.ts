import { Factory } from '@linode/utilities';

import type { Tag } from '@linode/api-v4';

export const tagFactory = Factory.Sync.makeFactory<Tag>({
  label: Factory.each((id) => `tag-${id + 1}`),
});
