import { Image } from '@linode/api-v4/lib/images/types';
import { Factory } from '@linode/utilities';

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
  regions: [],
  size: 1500,
  status: 'available',
  tags: [],
  total_size: 1500,
  type: 'manual',
  updated: new Date().toISOString(),
  vendor: null,
});
