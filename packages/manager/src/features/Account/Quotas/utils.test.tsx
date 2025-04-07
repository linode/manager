import { profileFactory } from '@linode/utilities';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import * as React from 'react';

import { quotaFactory, quotaUsageFactory } from 'src/factories/quotas';

import {
  getQuotaError,
  getQuotaIncreaseMessage,
  useGetLocationsForQuotaService,
} from './utils';

import type { QuotaUsage } from '@linode/api-v4';
import type { UseQueryResult } from '@tanstack/react-query';

const queryMocks = vi.hoisted(() => ({
  useObjectStorageEndpoints: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/object-storage/queries', () => {
  const actual = vi.importActual('src/queries/object-storage/queries');
  return {
    ...actual,
    useObjectStorageEndpoints: queryMocks.useObjectStorageEndpoints,
  };
});

describe('useGetLocationsForQuotaService', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  it('should handle object storage endpoints with null values', () => {
    const { result } = renderHook(
      () => useGetLocationsForQuotaService('object-storage'),
      {
        wrapper,
      }
    );

    expect(result.current.s3Endpoints).toEqual([
      { label: 'Global (Account level)', value: 'global' },
    ]);
  });

  it('should filter out endpoints with null s3_endpoint values', () => {
    queryMocks.useObjectStorageEndpoints.mockReturnValue({
      data: [
        {
          endpoint_type: 'E0',
          s3_endpoint: 'endpoint1',
        },
        {
          endpoint_type: 'E0',
          s3_endpoint: null,
        },
      ],
    });

    const { result } = renderHook(
      () => useGetLocationsForQuotaService('object-storage'),
      {
        wrapper,
      }
    );

    expect(result.current.s3Endpoints).toEqual([
      { label: 'Global (Account level)', value: 'global' },
      { label: 'endpoint1 (Standard E0)', value: 'endpoint1' },
    ]);
  });

  it('should return the error for a given quota usage query', () => {
    const quotaUsageQueries = ([
      { error: [{ reason: 'Error 1' }] },
      { error: [{ reason: 'Error 2' }] },
    ] as unknown) as UseQueryResult<QuotaUsage, Error>[];
    const index = 0;

    const error = getQuotaError(quotaUsageQueries, index);

    expect(error).toEqual('Error 1');
  });

  it('getQuotaIncreaseFormDefaultValues should return the correct default values', () => {
    const profile = profileFactory.build();
    const baseQuota = quotaFactory.build();
    const quotaUsage = quotaUsageFactory.build();
    const quota = {
      ...baseQuota,
      ...quotaUsage,
    };
    const quantity = 1;

    const defaultValues = getQuotaIncreaseMessage({
      profile,
      quantity,
      quota,
    });

    expect(defaultValues.description).toEqual(
      `**User**: ${profile.username}<br>\n**Email**: ${
        profile.email
      }<br>\n**Quota Name**: ${
        quota.quota_name
      }<br>\n**New Quantity Requested**: ${quantity} ${quota.resource_metric}${
        quantity > 1 ? 's' : ''
      }<br>\n**Region**: ${quota.region_applied}`
    );
  });
});
