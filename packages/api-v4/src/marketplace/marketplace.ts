import { createPartnerReferralSchema } from '@linode/validation';

import { BETA_API_ROOT } from 'src/constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from 'src/request';

import type {
  MarketplaceCategory,
  MarketplacePartner,
  MarketplacePartnerReferralPayload,
  MarketplaceProduct,
  MarketplaceType,
} from './types';
import type { Filter, ResourcePage as Page, Params } from 'src/types';

export const getMarketplaceProducts = (params?: Params, filters?: Filter) =>
  Request<Page<MarketplaceProduct>>(
    setURL(`${BETA_API_ROOT}/marketplace/products`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
  );

export const getMarketplaceProduct = (productId: number) =>
  Request<MarketplaceProduct>(
    setURL(
      `${BETA_API_ROOT}/marketplace/products/${encodeURIComponent(productId)}/details`,
    ),
    setMethod('GET'),
  );

export const getMarketplaceCategories = (params?: Params, filters?: Filter) =>
  Request<Page<MarketplaceCategory>>(
    setURL(`${BETA_API_ROOT}/marketplace/categories`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
  );

export const getMarketplaceTypes = (params?: Params, filters?: Filter) =>
  Request<Page<MarketplaceType>>(
    setURL(`${BETA_API_ROOT}/marketplace/types`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
  );

export const getMarketplacePartners = (params?: Params, filters?: Filter) =>
  Request<Page<MarketplacePartner>>(
    setURL(`${BETA_API_ROOT}/marketplace/partners`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
  );

export const createPartnerReferral = (
  data: MarketplacePartnerReferralPayload,
) =>
  Request<{}>(
    setURL(`${BETA_API_ROOT}/marketplace/contact`),
    setMethod('POST'),
    setData(data, createPartnerReferralSchema),
  );
