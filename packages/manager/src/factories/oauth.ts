import { Token } from '@linode/api-v4/lib/profile/types';
import * as Factory from 'factory.ts';

export const appTokenFactory = Factory.Sync.makeFactory<Token>({
  id: Factory.each(i => i),
  label: 'test-token',
  thumbnail_url: null,
  scopes: 'linodes:create',
  created: '2020-01-01T12:00:00',
  expiry: null,
  website: 'http://cloud.linode.com'
});
