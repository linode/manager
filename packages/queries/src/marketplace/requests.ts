import {
  getMarketplaceCategories,
  getMarketplacePartners,
  getMarketplaceProducts,
  getMarketplaceTypes,
} from '@linode/api-v4';
import { getAll } from '@linode/utilities';

import type {
  Filter,
  MarketplaceCategory,
  MarketplacePartner,
  MarketplaceProduct,
  MarketplaceType,
  Params,
} from '@linode/api-v4';

export const getAllMarketplaceProducts = (
  passedParams: Params = {},
  passedFilter: Filter = {},
) =>
  getAll<MarketplaceProduct>((params, filter) =>
    getMarketplaceProducts(
      { ...params, ...passedParams },
      { ...filter, ...passedFilter },
    ),
  )().then((data) => data.data);

export const getAllMarketplaceCategories = (
  passedParams: Params = {},
  passedFilter: Filter = {},
) =>
  getAll<MarketplaceCategory>((params, filter) =>
    getMarketplaceCategories(
      { ...params, ...passedParams },
      { ...filter, ...passedFilter },
    ),
  )().then((data) => data.data);

export const getAllMarketplaceTypes = (
  passedParams: Params = {},
  passedFilter: Filter = {},
) =>
  getAll<MarketplaceType>((params, filter) =>
    getMarketplaceTypes(
      { ...params, ...passedParams },
      { ...filter, ...passedFilter },
    ),
  )().then((data) => data.data);

export const getAllMarketplacePartners = (
  passedParams: Params = {},
  passedFilter: Filter = {},
) =>
  getAll<MarketplacePartner>((params, filter) =>
    getMarketplacePartners(
      { ...params, ...passedParams },
      { ...filter, ...passedFilter },
    ),
  )().then((data) => data.data);
