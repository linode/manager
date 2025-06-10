import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithThemeAndRouter } from 'src/utilities/testHelpers';

import { Quotas } from './Quotas';

const queryMocks = vi.hoisted(() => ({
  getQuotasFilters: vi.fn().mockReturnValue({}),
  useFlags: vi.fn().mockReturnValue({}),
  useGetLocationsForQuotaService: vi.fn().mockReturnValue({}),
  useObjectStorageEndpoints: vi.fn().mockReturnValue({}),
  convertResourceMetric: vi.fn().mockReturnValue({}),
  pluralizeMetric: vi.fn().mockReturnValue({}),
}));

vi.mock('src/hooks/useFlags', () => {
  const actual = vi.importActual('src/hooks/useFlags');
  return {
    ...actual,
    useFlags: queryMocks.useFlags,
  };
});

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useObjectStorageEndpoints: queryMocks.useObjectStorageEndpoints,
  };
});

vi.mock('./utils', () => ({
  getQuotasFilters: queryMocks.getQuotasFilters,
  useGetLocationsForQuotaService: queryMocks.useGetLocationsForQuotaService,
  convertResourceMetric: queryMocks.convertResourceMetric,
  pluralizeMetric: queryMocks.pluralizeMetric,
}));

describe('Quotas', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  it('renders the component with initial state', async () => {
    const { getByText } = await renderWithThemeAndRouter(<Quotas />, {
      queryClient,
    });

    expect(getByText('Quotas')).toBeInTheDocument();
    expect(getByText('Learn more about quotas')).toBeInTheDocument();
    expect(getByText('Object Storage Endpoint')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Select an Object Storage S3 endpoint')
    ).toBeInTheDocument();
    expect(
      getByText('Apply filters above to see quotas and current usage.')
    ).toBeInTheDocument();
  });

  it('allows endpoint selection', async () => {
    queryMocks.useGetLocationsForQuotaService.mockReturnValue({
      isFetchingS3Endpoints: false,
      regions: null,
      s3Endpoints: [{ label: 'endpoint1 (Standard E0)', value: 'endpoint1' }],
      service: 'object-storage',
    });

    const { getByPlaceholderText, getByRole } = await renderWithThemeAndRouter(
      <Quotas />,
      {
        queryClient,
      }
    );

    const endpointSelect = getByPlaceholderText(
      'Select an Object Storage S3 endpoint'
    );

    await waitFor(() => {
      expect(endpointSelect).not.toHaveValue(null);
    });

    await waitFor(() => {
      expect(endpointSelect).toBeInTheDocument();
    });

    await userEvent.click(endpointSelect);
    await waitFor(async () => {
      const endpointOption = getByRole('option', {
        name: 'endpoint1 (Standard E0)',
      });
      await userEvent.click(endpointOption);
    });

    await waitFor(() => {
      expect(endpointSelect).toHaveValue('endpoint1 (Standard E0)');
    });
  });

  it('shows loading state when fetching data', async () => {
    queryMocks.useGetLocationsForQuotaService.mockReturnValue({
      isFetchingS3Endpoints: true,
      s3Endpoints: null,
      service: 'object-storage',
    });

    const { getByPlaceholderText } = await renderWithThemeAndRouter(
      <Quotas />,
      {
        queryClient,
      }
    );

    expect(getByPlaceholderText('Loading S3 endpoints...')).toBeInTheDocument();
  });
});
