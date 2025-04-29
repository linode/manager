import { createQueryKeys } from '@lukemorales/query-key-factory';
import { useQueryClient } from '@tanstack/react-query';

export type BannerMeta = {
  id: string;
  component: string;
  props?: Record<string, any>;
};

export const bannersQueries = createQueryKeys('banners', {
  all: () => ({
    queryKey: [],
  }),
});

export const useBanners = () => {
  const queryClient = useQueryClient();
  return (
    queryClient.getQueryData<BannerMeta[]>(bannersQueries.all.queryKey) ?? []
  );
};

export const useAddBanner = () => {
  const queryClient = useQueryClient();
  return (banner: BannerMeta) => {
    queryClient.setQueryData<BannerMeta[]>(
      bannersQueries.all.queryKey,
      (prev = []) => [...prev, banner]
    );
  };
};

export const useRemoveBanner = () => {
  const queryClient = useQueryClient();
  return (bannerId: string) => {
    queryClient.setQueryData<BannerMeta[]>(
      bannersQueries.all.queryKey,
      (prev = []) => prev.filter((b) => b.id !== bannerId)
    );
  };
};

export const useClearBanners = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.setQueryData<BannerMeta[]>(bannersQueries.all.queryKey, []);
  };
};
