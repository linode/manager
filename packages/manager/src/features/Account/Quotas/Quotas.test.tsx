import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import * as React from 'react';

import { regionFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { Quotas } from './Quotas';

const queryMocks = vi.hoisted(() => ({
  useFlags: vi.fn().mockReturnValue({}),
  useGetLocationsForQuotaService: vi.fn().mockReturnValue({}),
  useGetRegionsQuery: vi.fn().mockReturnValue({}),
  useQuotasQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/regions/regions', () => ({
  useRegionsQuery: queryMocks.useGetRegionsQuery,
}));

vi.mock('src/hooks/useFlags', () => {
  const actual = vi.importActual('src/hooks/useFlags');
  return {
    ...actual,
    useFlags: queryMocks.useFlags,
  };
});

vi.mock('src/queries/quotas/quotas', () => ({
  useQuotasQuery: queryMocks.useQuotasQuery,
}));

vi.mock('./utils', () => ({
  useGetLocationsForQuotaService: queryMocks.useGetLocationsForQuotaService,
}));

describe('Quotas', () => {
  beforeEach(() => {
    queryMocks.useGetLocationsForQuotaService.mockReturnValue({
      isFetchingRegions: false,
      regions: [
        regionFactory.build({ id: 'global', label: 'Global (Account level)' }),
      ],
    });
    queryMocks.useGetRegionsQuery.mockReturnValue({
      data: [
        regionFactory.build({ id: 'global', label: 'Global (Account level)' }),
        regionFactory.build({ id: 'us-east', label: 'Newark, NJ' }),
      ],
      isFetching: false,
    });
    queryMocks.useQuotasQuery.mockReturnValue({
      data: { data: [] },
      isFetching: false,
      refetch: vi.fn(),
    });
  });

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  it('renders the component with initial state', () => {
    const { getByText } = renderWithTheme(
      <QueryClientProvider client={queryClient}>
        <Quotas />
      </QueryClientProvider>
    );

    expect(getByText('Quotas')).toBeInTheDocument();
    expect(getByText('Learn More About Quotas')).toBeInTheDocument();
    expect(getByText('Select a Service')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Select a region for Linodes')
    ).toBeInTheDocument();
  });

  it('allows service selection', async () => {
    const { getByPlaceholderText, getByRole } = renderWithTheme(
      <QueryClientProvider client={queryClient}>
        <Quotas />
      </QueryClientProvider>
    );

    const serviceSelect = getByPlaceholderText('Select a service');

    await waitFor(() => {
      expect(serviceSelect).toHaveValue('Linodes');
      expect(
        getByPlaceholderText('Select a region for Linodes')
      ).toBeInTheDocument();
    });

    fireEvent.focus(serviceSelect);
    fireEvent.change(serviceSelect, { target: { value: 'Kubernetes' } });
    await waitFor(() => {
      const kubernetesOption = getByRole('option', { name: 'Kubernetes' });
      fireEvent.click(kubernetesOption);
    });

    await waitFor(() => {
      expect(serviceSelect).toHaveValue('Kubernetes');
      expect(
        getByPlaceholderText('Select a region for Kubernetes')
      ).toBeInTheDocument();
    });

    fireEvent.focus(serviceSelect);
    fireEvent.change(serviceSelect, { target: { value: 'Object Storage' } });
    await waitFor(() => {
      const objectStorageOption = getByRole('option', {
        name: 'Object Storage',
      });
      fireEvent.click(objectStorageOption);
    });

    await waitFor(() => {
      expect(serviceSelect).toHaveValue('Object Storage');
      expect(
        getByPlaceholderText('Select an Object Storage S3 endpoint')
      ).toBeInTheDocument();
    });
  });

  it('shows loading state when fetching data', () => {
    queryMocks.useQuotasQuery.mockReturnValue({
      data: null,
      isFetching: true,
      refetch: vi.fn(),
    });

    queryMocks.useGetLocationsForQuotaService.mockReturnValue({
      isFetchingRegions: true,
      regions: [],
    });

    const { getByPlaceholderText } = renderWithTheme(
      <QueryClientProvider client={queryClient}>
        <Quotas />
      </QueryClientProvider>
    );

    expect(
      getByPlaceholderText('Loading Linodes regions...')
    ).toBeInTheDocument();
  });

  it('shows a global option for regions', async () => {
    const { getByPlaceholderText, getByText } = renderWithTheme(
      <QueryClientProvider client={queryClient}>
        <Quotas />
      </QueryClientProvider>
    );

    const regionSelect = getByPlaceholderText('Select a region for Linodes');
    expect(regionSelect).toHaveValue('');

    fireEvent.focus(regionSelect);
    fireEvent.change(regionSelect, { target: { value: 'global' } });
    await waitFor(() => {
      const globalOption = getByText('Global (Account level) (global)');
      fireEvent.click(globalOption);
    });

    expect(regionSelect).toHaveValue('Global (Account level) (global)');
  });
});
