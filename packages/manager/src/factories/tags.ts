import { Tag } from '@linode/api-v4/lib/tags/types';
import Factory from '@factory';

export const tagFactory = Factory.Sync.makeFactory<Tag>({
  label: Factory.each((id) => `tag-${id + 1}`),
});
