import { Image } from '@linode/api-v4/lib/images/types';
import * as Factory from 'factory.ts';

export const imageFactory = Factory.Sync.makeFactory<Image>({
  capabilities: [],
  created: new Date().toISOString(),
  created_by: 'prod-test-004',
  deprecated: false,
  description: 'An image',
  eol: new Date().toISOString(),
  expiry: null,
  id: Factory.each((id) => `private/${id}`),
  is_public: false,
  label: Factory.each((i) => `image-${i}`),
  size: 1500,
  status: 'available',
  type: 'manual',
  updated: new Date().toISOString(),
  vendor: null,
});
