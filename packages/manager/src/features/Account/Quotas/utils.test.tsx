import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import * as React from 'react';

import { useGetLocationsForQuotaService } from './utils';

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
});
