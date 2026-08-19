import { waitFor } from '@testing-library/react';
import * as React from 'react';

import {
  linodeQuotaFactory,
  objEndpointQuotaFactory,
  quotaUsageFactory,
} from 'src/factories/quotas';
import {
  linodeQuotaService,
  objectStorageQuotaService,
} from 'src/features/Account/Quotas/quotaServices';
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
  useAllQuotasQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    quotaQueries: queryMocks.quotaQueries,
    useQuotaUsageQuery: queryMocks.useQuotaUsageQuery,
    useAllQuotasQuery: queryMocks.useAllQuotasQuery,
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
  it('should render', async () => {
    const { getByRole, getByTestId, getByText } = renderWithTheme(
      <QuotasTable
        scope={'region'}
        scopeValue={null}
        service={linodeQuotaService}
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
      linodeQuotaFactory.build({
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
    queryMocks.useAllQuotasQuery.mockReturnValue({
      data: quotas,
      isFetching: false,
    });
    queryMocks.useQuotaUsageQuery.mockReturnValue({
      data: quotaUsage,
      isFetching: false,
    });

    const { getByLabelText, getByTestId, getByText } = renderWithTheme(
      <QuotasTable
        scope={'region'}
        scopeValue={'us-east'}
        service={linodeQuotaService}
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

  it('should display object storage throughput quotas correctly', async () => {
    queryMocks.useAllQuotasQuery.mockReturnValue({
      data: [
        objEndpointQuotaFactory.build({
          quota_name: 'Ingress Throughput (per endpoint)',
          description:
            'Current total ingress bandwidth per account, per endpoint',
          quota_limit: 1250000000,
          quota_type: 'obj-total-ingress-throughput',
          resource_metric: 'byte_per_second',
          has_usage: false,
        }),
        objEndpointQuotaFactory.build({
          quota_name: 'Egress Throughput (per endpoint)',
          description:
            'Current total egress bandwidth per account, per endpoint',
          quota_limit: 2500000000,
          quota_type: 'obj-total-egress-throughput',
          resource_metric: 'byte_per_second',
          has_usage: false,
        }),
      ],
      isFetching: false,
    });

    const { getByLabelText, getAllByRole, getByRole } = renderWithTheme(
      <QuotasTable
        scope={'obj-endpoint'}
        scopeValue={'endpoint.linodeobjects.com'}
        service={objectStorageQuotaService()}
      />
    );

    await waitFor(() => {
      expect(getByRole('table')).toBeInTheDocument();
      expect(getAllByRole('row')).toHaveLength(3);

      const ingressActionMenu = getByLabelText(
        'Action menu for quota Ingress Throughput'
      );
      const ingressRow = ingressActionMenu.closest('tr');
      expect(ingressRow).not.toBeNull();
      expect(ingressRow).toHaveTextContent('Ingress Throughput');
      expect(ingressRow).toHaveTextContent('10 Gbps');
      expect(
        getByLabelText(
          'Current total ingress bandwidth per account, per endpoint'
        )
      ).toBeInTheDocument();

      const ingressUsageLink = ingressRow!.querySelector('a');
      expect(ingressUsageLink).not.toBeNull();
      expect(ingressUsageLink).toHaveTextContent(
        'Ingress usage available in Metrics'
      );
      expect(ingressUsageLink).toHaveAttribute('href', '/metrics');

      const egressActionMenu = getByLabelText(
        'Action menu for quota Egress Throughput'
      );
      const egressRow = egressActionMenu.closest('tr');
      expect(egressRow).not.toBeNull();
      expect(egressRow).toHaveTextContent('Egress Throughput');
      expect(egressRow).toHaveTextContent('20 Gbps');
      expect(
        getByLabelText(
          'Current total egress bandwidth per account, per endpoint'
        )
      ).toBeInTheDocument();

      const egressUsageLink = egressRow!.querySelector('a');
      expect(egressUsageLink).not.toBeNull();
      expect(egressUsageLink).toHaveTextContent(
        'Egress usage available in Metrics'
      );
      expect(egressUsageLink).toHaveAttribute('href', '/metrics');
    });
  });
});
