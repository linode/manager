import * as Factory from 'factory.ts';
import { Tag } from '@linode/api-v4/lib/tags/types';

export const tagFactory = Factory.Sync.makeFactory<Tag>({
  label: Factory.each((id) => `tag-${id + 1}`),
});
