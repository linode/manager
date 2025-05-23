import { waitFor } from '@testing-library/react';
import * as React from 'react';

import { quotaFactory, quotaUsageFactory } from 'src/factories/quotas';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { QuotasTable } from './QuotasTable';

const queryMocks = vi.hoisted(() => ({
  quotaQueries: {
    service: vi.fn().mockReturnValue({
      _ctx: {
        usage: vi.fn().mockReturnValue({}),
      },
    }),
  },
  useQueries: vi.fn().mockReturnValue([]),
  useQuotaUsageQuery: vi.fn().mockReturnValue({}),
  useQuotasQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    quotaQueries: queryMocks.quotaQueries,
    useQuotaUsageQuery: queryMocks.useQuotaUsageQuery,
    useQuotasQuery: queryMocks.useQuotasQuery,
  };
});

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQueries: queryMocks.useQueries,
  };
});

describe('QuotasTable', () => {
  it('should render', () => {
    const { getByRole, getByTestId, getByText } = renderWithTheme(
      <QuotasTable
        selectedLocation={null}
        selectedService={{
          label: 'Linodes',
          value: 'linode',
        }}
      />
    );
    expect(
      getByRole('columnheader', { name: 'Quota Name' })
    ).toBeInTheDocument();
    expect(
      getByRole('columnheader', { name: 'Account Quota Value' })
    ).toBeInTheDocument();
    expect(getByRole('columnheader', { name: 'Usage' })).toBeInTheDocument();
    expect(getByTestId('table-row-empty')).toBeInTheDocument();
    expect(
      getByText('Apply filters above to see quotas and current usage.')
    ).toBeInTheDocument();
  });

  it('should render a table with the correct data', async () => {
    const quotas = [
      quotaFactory.build({
        description: 'Random Quota Description',
        quota_limit: 100,
        quota_name: 'Random Quota',
        region_applied: 'us-east',
      }),
    ];
    const quotaUsage = quotaUsageFactory.build({
      quota_limit: 100,
      usage: 10,
    });
    queryMocks.useQueries.mockReturnValue([
      {
        data: quotaUsage,
        isLoading: false,
      },
    ]);
    queryMocks.useQuotasQuery.mockReturnValue({
      data: {
        data: quotas,
        page: 1,
        pages: 1,
        results: 1,
      },
      isFetching: false,
    });
    queryMocks.useQuotaUsageQuery.mockReturnValue({
      data: quotaUsage,
      isFetching: false,
    });

    const { getByLabelText, getByTestId, getByText } = renderWithTheme(
      <QuotasTable
        selectedLocation={{
          label: 'NJ',
          value: 'us-east',
        }}
        selectedService={{
          label: 'Linodes',
          value: 'linode',
        }}
      />
    );

    const quota = quotas[0];

    await waitFor(() => {
      expect(getByText(quota.quota_name)).toBeInTheDocument();
      expect(
        getByText(`${quota.quota_limit} ${quota.resource_metric}s`)
      ).toBeInTheDocument();
      expect(getByLabelText(quota.description)).toBeInTheDocument();
      expect(getByTestId('linear-progress')).toBeInTheDocument();
      expect(
        getByText(`${quotaUsage.usage} of ${quotaUsage.quota_limit} CPUs used`)
      ).toBeInTheDocument();
      expect(
        getByLabelText(`Action menu for quota ${quota.quota_name}`)
      ).toBeInTheDocument();
    });
  });
});
