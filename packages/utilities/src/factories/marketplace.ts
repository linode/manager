import { Factory } from './factoryProxy';

import type {
  MarketplaceCategory,
  MarketplacePartner,
  MarketplaceProduct,
  MarketplaceType,
} from '@linode/api-v4';

export const marketplaceProductFactory =
  Factory.Sync.makeFactory<MarketplaceProduct>({
    id: Factory.each((id) => id),
    name: Factory.each((id) => `marketplace-product-${id}`),
    partner_id: Factory.each((id) => id),
    type_id: Factory.each((id) => id),
    category_ids: [1, 2],
    short_description:
      'This is a short description of the marketplace product.',
    title_tag: 'Marketplace Product Title Tag',
    product_tags: ['tag1', 'tag2'],
  });

export const marketplaceCategoryFactory =
  Factory.Sync.makeFactory<MarketplaceCategory>({
    id: Factory.each((id) => id),
    category: Factory.each((id) => `marketplace-category-${id}`),
    product_count: Factory.each((id) => id * 10),
  });

export const marketplaceTypeFactory = Factory.Sync.makeFactory<MarketplaceType>(
  {
    id: Factory.each((id) => id),
    name: Factory.each((id) => `marketplace-type-${id}`),
    product_count: Factory.each((id) => id * 5),
  },
);

export const marketplacePartnersFactory =
  Factory.Sync.makeFactory<MarketplacePartner>({
    id: Factory.each((id) => id),
    name: Factory.each((id) => `marketplace-partner-${id}`),
    url: 'https://www.example.com',
    logo_url_light_mode: 'https://www.example.com/logo-light-mode.png',
    logo_url_night_mode: 'https://www.example.com/logo-night-mode.png',
  });
