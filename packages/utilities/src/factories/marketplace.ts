import { Factory } from './factoryProxy';

import type {
  MarketplaceCategory,
  MarketplacePartner,
  MarketplaceProduct,
  MarketplaceType,
} from '@linode/api-v4';

export const marketplaceProductFactory =
  Factory.Sync.makeFactory<MarketplaceProduct>({
    category_ids: [1, 2],
    created_at: '2024-01-01T00:00:00',
    created_by: 'user1',
    id: Factory.each((id) => id),
    logo_url: 'https://www.example.com/logo.png',
    name: Factory.each((id) => `marketplace-product-${id}`),
    partner_id: Factory.each((id) => id),
    product_tags: ['tag1', 'tag2'],
    short_description:
      'This is a short description of the marketplace product.',
    tile_tag: '60 days free trial',
    type_id: Factory.each((id) => id),
  });

export const marketplaceCategoryFactory =
  Factory.Sync.makeFactory<MarketplaceCategory>({
    name: Factory.each((id) => `marketplace-category-${id}`),
    created_at: '2024-01-01T00:00:00',
    created_by: 'user1',
    id: Factory.each((id) => id),
    products_count: 10,
  });

export const marketplaceTypeFactory = Factory.Sync.makeFactory<MarketplaceType>(
  {
    created_at: '2024-01-01T00:00:00',
    created_by: 'user1',
    id: Factory.each((id) => id),
    products_count: 5,
    name: Factory.each((id) => `marketplace-type-${id}`),
  },
);

export const marketplacePartnersFactory =
  Factory.Sync.makeFactory<MarketplacePartner>({
    created_at: '2024-01-01T00:00:00',
    created_by: 'user1',
    id: Factory.each((id) => id),
    logo_url_dark_mode: 'https://www.akamai.com/site/akamai-logo-v5.svg',
    logo_url_light_mode: 'https://www.akamai.com/site/akamai-logo-v5.svg',
    name: Factory.each((id) => `marketplace-partner-${id}`),
    url: 'https://www.example.com',
  });
