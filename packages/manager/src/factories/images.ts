import * as Factory from 'factory.ts';
import { Image } from 'linode-js-sdk/lib/images/types';

export const imageFactory = Factory.Sync.makeFactory<Image>({
  id: Factory.each(id => `private/${id}`),
  label: Factory.each(i => `event-entity-${i}`),
  description: 'An image',
  deprecated: false,
  created: new Date().toString(),
  created_by: 'prod-test-004',
  is_public: false,
  size: 1500,
  type: 'image',
  vendor: null,
  expiry: null
});
