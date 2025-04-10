import { regionFactory } from '@linode/utilities';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { Quotas } from './Quotas';

const queryMocks = vi.hoisted(() => ({
  getQuotasFilters: vi.fn().mockReturnValue({}),
  useFlags: vi.fn().mockReturnValue({}),
  useGetLocationsForQuotaService: vi.fn().mockReturnValue({}),
  useGetRegionsQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async (importOriginal) => ({
  ...(await importOriginal()),
  useRegionsQuery: queryMocks.useGetRegionsQuery,
}));

vi.mock('src/hooks/useFlags', () => {
  const actual = vi.importActual('src/hooks/useFlags');
  return {
    ...actual,
    useFlags: queryMocks.useFlags,
  };
});

vi.mock('./utils', () => ({
  getQuotasFilters: queryMocks.getQuotasFilters,
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
  });

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  it('renders the component with initial state', () => {
    const { getByText } = renderWithTheme(<Quotas />, {
      queryClient,
    });

    expect(getByText('Quotas')).toBeInTheDocument();
    expect(getByText('Learn More About Quotas')).toBeInTheDocument();
    expect(getByText('Select a Service')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Select a region for Linodes')
    ).toBeInTheDocument();
  });

  it('allows service selection', async () => {
    const { getByPlaceholderText, getByRole } = renderWithTheme(<Quotas />, {
      queryClient,
    });

    const serviceSelect = getByPlaceholderText('Select a service');

    await waitFor(() => {
      expect(serviceSelect).toHaveValue('Linodes');
      expect(
        getByPlaceholderText('Select a region for Linodes')
      ).toBeInTheDocument();
    });

    userEvent.click(serviceSelect);
    await waitFor(() => {
      const kubernetesOption = getByRole('option', { name: 'Kubernetes' });
      userEvent.click(kubernetesOption);
    });

    await waitFor(() => {
      expect(serviceSelect).toHaveValue('Kubernetes');
      expect(
        getByPlaceholderText('Select a region for Kubernetes')
      ).toBeInTheDocument();
    });

    userEvent.click(serviceSelect);
    await waitFor(() => {
      const objectStorageOption = getByRole('option', {
        name: 'Object Storage',
      });
      userEvent.click(objectStorageOption);
    });

    await waitFor(() => {
      expect(serviceSelect).toHaveValue('Object Storage');
      expect(
        getByPlaceholderText('Select an Object Storage S3 endpoint')
      ).toBeInTheDocument();
    });
  });

  it('shows loading state when fetching data', () => {
    queryMocks.useGetLocationsForQuotaService.mockReturnValue({
      isFetchingRegions: true,
      regions: [],
    });

    const { getByPlaceholderText } = renderWithTheme(<Quotas />, {
      queryClient,
    });

    expect(
      getByPlaceholderText('Loading Linodes regions...')
    ).toBeInTheDocument();
  });

  it('shows a global option for regions', async () => {
    const { getByPlaceholderText, getByRole } = renderWithTheme(<Quotas />, {
      queryClient,
    });

    const regionSelect = getByPlaceholderText('Select a region for Linodes');
    expect(regionSelect).toHaveValue('');

    userEvent.click(regionSelect);
    await waitFor(() => {
      const globalOption = getByRole('option', {
        name: 'Global (Account level) (global)',
      });
      userEvent.click(globalOption);
    });

    await waitFor(() => {
      expect(regionSelect).toHaveValue('Global (Account level) (global)');
    });
  });
});
