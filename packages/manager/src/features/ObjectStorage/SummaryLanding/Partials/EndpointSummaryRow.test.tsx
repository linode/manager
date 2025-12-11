import * as React from 'react';

import { quotaFactory, quotaUsageFactory } from 'src/factories/quotas';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { EndpointSummaryRow } from './EndpointSummaryRow';

const testEndpoint = 'us-southeast-1.linodeobjects.com';

const queryMocks = vi.hoisted(() => ({
  quotaQueries: {
    service: vi.fn().mockReturnValue({
      _ctx: {
        usage: vi.fn().mockReturnValue({}),
      },
    }),
  },
  useQueries: vi.fn().mockReturnValue([]),
  useQuotasQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    quotaQueries: queryMocks.quotaQueries,
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

const quotasMock = [
  quotaFactory.build({
    quota_id: `obj-buckets-${testEndpoint}`,
    quota_name: 'Number of Buckets',
    endpoint_type: 'E1',
    s3_endpoint: testEndpoint,
    description: 'Current number of buckets per account, per endpoint',
    quota_limit: 10,
    resource_metric: 'bucket',
  }),
  quotaFactory.build({
    quota_id: `obj-bytes-${testEndpoint}`,
    quota_name: 'Total Capacity',
    endpoint_type: 'E1',
    s3_endpoint: testEndpoint,
    description: 'Current total capacity per account, per endpoint',
    quota_limit: 2048,
    resource_metric: 'byte',
  }),
  quotaFactory.build({
    quota_id: `obj-objects-${testEndpoint}`,
    quota_name: 'Number of Objects',
    endpoint_type: 'E1',
    s3_endpoint: testEndpoint,
    description: 'Current number of objects per account, per endpoint',
    quota_limit: 10,
    resource_metric: 'object',
  }),
];

const bucketsUsageMock = quotaUsageFactory.build({
  quota_limit: 10,
  usage: 3,
});
const bytesUsageMock = quotaUsageFactory.build({
  quota_limit: 2048,
  usage: 1024,
});
const objectsUsageMock = quotaUsageFactory.build({
  quota_limit: 10,
  usage: 5,
});

const errorMock = { error: [{ reason: 'An error occurred.' }] };

describe('EndpointSummaryRow', () => {
  it('should display usage per endpoint', async () => {
    queryMocks.useQueries.mockReturnValue([
      {
        data: bucketsUsageMock,
        isFetching: false,
      },
      {
        data: bytesUsageMock,
        isFetching: false,
      },
      {
        data: objectsUsageMock,
        isFetching: false,
      },
    ]);

    queryMocks.useQuotasQuery.mockReturnValue({
      data: {
        data: quotasMock,
        page: 1,
        pages: 1,
        results: 1,
      },
      isFetching: false,
    });

    const { findByText, findAllByText } = renderWithTheme(
      <EndpointSummaryRow endpoint={testEndpoint} />
    );

    const cellEndpoints = await findAllByText(testEndpoint);
    expect(cellEndpoints.length).toBe(3);
    cellEndpoints.forEach((endpoint) => {
      expect(endpoint).toBeVisible();
    });
    expect(await findByText('3 of 10 Buckets used')).toBeVisible();
    expect(await findByText('1 of 2 KB used')).toBeVisible();
    expect(await findByText('5 of 10 Objects used')).toBeVisible();
  });

  it('should display error if quotas request is failed', async () => {
    queryMocks.useQueries.mockReturnValue([
      {
        data: bucketsUsageMock,
        isFetching: false,
      },
      {
        data: bytesUsageMock,
        isFetching: false,
      },
      {
        data: objectsUsageMock,
        isFetching: false,
      },
    ]);

    queryMocks.useQuotasQuery.mockReturnValue({
      isFetching: false,
      isError: true,
      error: errorMock,
    });

    const { findByText } = renderWithTheme(
      <EndpointSummaryRow endpoint={testEndpoint} />
    );

    expect(
      await findByText(
        `There was an error retrieving ${testEndpoint} endpoint data.`
      )
    ).toBeVisible();
  });

  it('should display error if any usage request is failed', async () => {
    queryMocks.useQueries.mockReturnValue([
      {
        isFetching: false,
        isError: true,
        error: errorMock,
      },
      {
        data: bytesUsageMock,
        isFetching: false,
      },
      {
        data: objectsUsageMock,
        isFetching: false,
      },
    ]);

    queryMocks.useQuotasQuery.mockReturnValue({
      data: {
        data: quotasMock,
        page: 1,
        pages: 1,
        results: 1,
      },
      isFetching: false,
    });

    const { findByText } = renderWithTheme(
      <EndpointSummaryRow endpoint={testEndpoint} />
    );

    expect(
      await findByText(
        `There was an error retrieving ${testEndpoint} endpoint data.`
      )
    ).toBeVisible();
  });
});
