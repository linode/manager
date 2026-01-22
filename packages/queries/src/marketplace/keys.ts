import {
  getMarketplaceCategories,
  getMarketplacePartners,
  getMarketplaceProduct,
  getMarketplaceProducts,
  getMarketplaceTypes,
} from '@linode/api-v4';
import { createQueryKeys } from '@lukemorales/query-key-factory';

import {
  getAllMarketplaceCategories,
  getAllMarketplacePartners,
  getAllMarketplaceProducts,
  getAllMarketplaceTypes,
} from './requests';

import type { Filter, Params } from '@linode/api-v4';

export const marketplaceQueries = createQueryKeys('marketplace', {
  product: (productId: number) => ({
    queryFn: () => getMarketplaceProduct(productId),
    queryKey: [productId],
  }),
  products: {
    contextQueries: {
      all: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getAllMarketplaceProducts(params, filter),
        queryKey: [params, filter],
      }),
      infinite: (filter: Filter = {}) => ({
        queryFn: ({ pageParam }) =>
          getMarketplaceProducts(
            // Default page_size for infinite products list is 30 as we are showing 6 products at a time
            { page: pageParam as number, page_size: 30 },
            filter,
          ),
        queryKey: [filter],
      }),
      paginated: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getMarketplaceProducts(params, filter),
        queryKey: [params, filter],
      }),
    },
    queryKey: null,
  },
  categories: {
    contextQueries: {
      all: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getAllMarketplaceCategories(params, filter),
        queryKey: [params, filter],
      }),
      infinite: (filter: Filter = {}) => ({
        queryFn: ({ pageParam }) =>
          getMarketplaceCategories(
            { page: pageParam as number, page_size: 25 },
            filter,
          ),
        queryKey: [filter],
      }),
      paginated: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getMarketplaceCategories(params, filter),
        queryKey: [params, filter],
      }),
    },
    queryKey: null,
  },
  types: {
    contextQueries: {
      all: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getAllMarketplaceTypes(params, filter),
        queryKey: [params, filter],
      }),
      infinite: (filter: Filter = {}) => ({
        queryFn: ({ pageParam }) =>
          getMarketplaceTypes(
            { page: pageParam as number, page_size: 25 },
            filter,
          ),
        queryKey: [filter],
      }),
      paginated: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getMarketplaceTypes(params, filter),
        queryKey: [params, filter],
      }),
    },
    queryKey: null,
  },
  partners: {
    contextQueries: {
      all: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getAllMarketplacePartners(params, filter),
        queryKey: [params, filter],
      }),
      infinite: (filter: Filter = {}) => ({
        queryFn: ({ pageParam }) =>
          getMarketplacePartners(
            { page: pageParam as number, page_size: 25 },
            filter,
          ),
        queryKey: [filter],
      }),
      paginated: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getMarketplacePartners(params, filter),
        queryKey: [params, filter],
      }),
    },
    queryKey: null,
  },
});
