import { Factory } from './factoryProxy';

import type { Image } from '@linode/api-v4';

export const imageFactory = Factory.Sync.makeFactory<Image>({
  capabilities: ['distributed-sites'],
  created: new Date().toISOString(),
  created_by: 'prod-test-004',
  deprecated: false,
  description: 'A sample image',
  eol: null,
  expiry: null,
  id: Factory.each((id) => `private/${id}`),
  image_sharing: {
    shared_by: null,
    shared_with: {
      sharegroup_count: 0,
      sharegroup_list_url: '/images/private/123/sharegroups',
    },
  },
  is_public: false,
  is_shared: false,
  label: Factory.each((i) => `image-${i}`),
  regions: [
    {
      region: 'us-east',
      status: 'available',
    },
  ],
  size: 4960,
  status: 'available',
  tags: [],
  total_size: 20480,
  type: 'manual',
  updated: new Date().toISOString(),
  vendor: null,
});

export const imageSharegroupFactory = Factory.Sync.makeFactory({
  id: Factory.each((id) => id),
  uuid: Factory.each((i) => `eb5b9f0f-2e70-46a6-aee4-a081a2b9969${i}`),
  members_count: 1,
  images_count: 1,
  label: Factory.each((i) => `sharegroup-${i}`),
  description: 'A sample shared image group',
  is_suspended: false,
  created: '2019-12-12T00:00:00',
  updated: '2019-12-12T00:00:00',
  expiry: null,
});

export const imageSharegroupMemberFactory = Factory.Sync.makeFactory({
  token_uuid: Factory.each((i) => `24wef-243qg-45wgg-q343${i}`),
  status: 'accepted',
  label: Factory.each((i) => `member-${i}`),
  created: '2019-12-12T00:00:00',
  updated: '2019-12-12T00:00:00',
  expiry: null,
});
