import * as Factory from 'factory.ts';
import { Image } from '@linode/api-v4/lib/images/types';

export const imageFactory = Factory.Sync.makeFactory<Image>({
  id: Factory.each((id) => `private/${id}`),
  label: Factory.each((i) => `image-${i}`),
  description: 'An image',
  deprecated: false,
  created: new Date().toISOString(),
  updated: new Date().toISOString(),
  created_by: 'prod-test-004',
  is_public: false,
  size: 1500,
  type: 'image',
  vendor: null,
  expiry: null,
  status: 'available',
});
