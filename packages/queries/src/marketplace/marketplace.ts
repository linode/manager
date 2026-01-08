import { APIError, createPartnerReferral, ResourcePage } from '@linode/api-v4';
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { accountQueries } from '../account';
import { marketplaceQueries } from './keys';

import type {
  Filter,
  MarketplaceCategory,
  MarketplacePartner,
  MarketplacePartnerReferralPayload,
  MarketplaceProduct,
  Params,
} from '@linode/api-v4';

export const useMarketplaceProductsQuery = (
  params: Params,
  filter: Filter,
  enabled: boolean = false,
) =>
  useQuery<ResourcePage<MarketplaceProduct>, APIError[]>({
    ...marketplaceQueries.products._ctx.paginated(params, filter),
    enabled,
    placeholderData: keepPreviousData,
  });

export const useAllMarketplaceProductsQuery = (
  params: Params = {},
  filter: Filter = {},
  enabled: boolean = false,
) =>
  useQuery<MarketplaceProduct[], APIError[]>({
    ...marketplaceQueries.products._ctx.all(params, filter),
    enabled,
  });

export const useInfiniteMarketplaceProductsQuery = (
  filter: Filter,
  enabled: boolean,
) =>
  useInfiniteQuery<ResourcePage<MarketplaceProduct>, APIError[]>({
    ...marketplaceQueries.products._ctx.infinite(filter),
    enabled,
    getNextPageParam: ({ page, pages }) => {
      if (page === pages) {
        return undefined;
      }
      return page + 1;
    },
    initialPageParam: 1,
    retry: false,
  });

export const useMarketplaceProductQuery = (
  productId: number,
  enabled: boolean = false,
) =>
  useQuery<MarketplaceProduct, APIError[]>({
    ...marketplaceQueries.product(productId),
    enabled,
  });

export const useMarketplaceCategoriesQuery = (
  params: Params,
  filter: Filter,
  enabled: boolean = false,
) =>
  useQuery<ResourcePage<MarketplaceCategory>, APIError[]>({
    ...marketplaceQueries.categories._ctx.paginated(params, filter),
    enabled,
    placeholderData: keepPreviousData,
  });

export const useAllMarketplaceCategoriesQuery = (
  params: Params = {},
  filter: Filter = {},
  enabled: boolean = false,
) =>
  useQuery<MarketplaceCategory[], APIError[]>({
    ...marketplaceQueries.categories._ctx.all(params, filter),
    enabled,
  });

export const useInfiniteMarketplaceCategoriesQuery = (
  filter: Filter,
  enabled: boolean,
) =>
  useInfiniteQuery<ResourcePage<MarketplaceCategory>, APIError[]>({
    ...marketplaceQueries.categories._ctx.infinite(filter),
    enabled,
    getNextPageParam: ({ page, pages }) => {
      if (page === pages) {
        return undefined;
      }
      return page + 1;
    },
    initialPageParam: 1,
    retry: false,
  });

export const useMarketplacePartnersQuery = (
  params: Params,
  filter: Filter,
  enabled: boolean = false,
) =>
  useQuery<ResourcePage<MarketplacePartner>, APIError[]>({
    ...marketplaceQueries.partners._ctx.paginated(params, filter),
    enabled,
    placeholderData: keepPreviousData,
  });

export const useAllMarketplacePartnersQuery = (
  params: Params = {},
  filter: Filter = {},
  enabled: boolean = false,
) =>
  useQuery<MarketplacePartner[], APIError[]>({
    ...marketplaceQueries.partners._ctx.all(params, filter),
    enabled,
  });

export const useInfiniteMarketplacePartnersQuery = (
  filter: Filter,
  enabled: boolean,
) =>
  useInfiniteQuery<ResourcePage<MarketplacePartner>, APIError[]>({
    ...marketplaceQueries.partners._ctx.infinite(filter),
    enabled,
    getNextPageParam: ({ page, pages }) => {
      if (page === pages) {
        return undefined;
      }
      return page + 1;
    },
    initialPageParam: 1,
    retry: false,
  });

export const useCreatePartnerReferralMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], MarketplacePartnerReferralPayload>({
    mutationFn: createPartnerReferral,
    onSuccess: () => {
      setTimeout(() => {
        // Refetch notifications after 1.5 seconds. The API needs some time to process.
        queryClient.invalidateQueries({
          queryKey: accountQueries.notifications.queryKey,
        });
      }, 1500);
    },
  });
};
