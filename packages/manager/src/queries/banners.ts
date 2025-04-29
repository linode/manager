// src/queries/banners.ts
import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { createQueryKeys } from '@lukemorales/query-key-factory';

export type BannerEntry = { key: string; banner: React.ReactNode };

// 👇 Structured query key
export const bannersQueryKey = createQueryKeys('banners', {
  all: (filters?: string) => [filters],
});

export const useBanners = () => {
  const queryClient = useQueryClient();

  const getBanners = (): BannerEntry[] => {
    return queryClient.getQueryData<BannerEntry[]>(bannersQueryKey.all()) ?? [];
  };

  const registerBanner = (entry: BannerEntry) => {
    queryClient.setQueryData<BannerEntry[]>(
      bannersQueryKey.all(),
      (old = []) => {
        const exists = old.some((e) => e.key === entry.key);
        if (exists) return old;
        return [...old, entry];
      }
    );
  };

  const clearBanner = (key: string) => {
    queryClient.setQueryData<BannerEntry[]>(bannersQueryKey.all(), (old = []) =>
      old.filter((entry) => entry.key !== key)
    );
  };

  const clearAllBanners = () => {
    queryClient.setQueryData<BannerEntry[]>(bannersQueryKey.all(), []);
  };

  return { getBanners, registerBanner, clearBanner, clearAllBanners };
};
