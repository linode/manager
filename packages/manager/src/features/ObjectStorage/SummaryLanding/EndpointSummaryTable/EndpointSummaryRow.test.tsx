import * as React from 'react';

import { objectStorageEndpointsFactory } from 'src/factories';
import {
  objEndpointQuotaFactory,
  quotaUsageFactory,
} from 'src/factories/quotas';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { EndpointSummaryRow } from './EndpointSummaryRow';

const objectStorageEndpointMock = objectStorageEndpointsFactory.build({
  s3_endpoint: 'us-southeast-1.linodeobjects.com',
});

const s3Endpoint = objectStorageEndpointMock.s3_endpoint ?? '';

const queryMocks = vi.hoisted(() => ({
  quotaQueries: {
    service: vi.fn().mockReturnValue({
      _ctx: {
        usage: vi.fn().mockReturnValue({}),
      },
    }),
  },
  useQueries: vi.fn().mockReturnValue([]),
  useAllQuotasQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    quotaQueries: queryMocks.quotaQueries,
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

const quotasMock = [
  objEndpointQuotaFactory.build({
    quota_id: `obj-buckets-${s3Endpoint}`,
    quota_type: 'obj-buckets',
    quota_name: 'Number of Buckets',
    endpoint_type: 'E1',
    s3_endpoint: s3Endpoint,
    description: 'Current number of buckets per account, per endpoint',
    quota_limit: 10,
    resource_metric: 'bucket',
  }),
  objEndpointQuotaFactory.build({
    quota_id: `obj-bytes-${s3Endpoint}`,
    quota_type: 'obj-bytes',
    quota_name: 'Total Capacity',
    endpoint_type: 'E1',
    s3_endpoint: s3Endpoint,
    description: 'Current total capacity per account, per endpoint',
    quota_limit: 2048,
    resource_metric: 'byte',
  }),
  objEndpointQuotaFactory.build({
    quota_id: `obj-objects-${s3Endpoint}`,
    quota_type: 'obj-objects',
    quota_name: 'Number of Objects',
    endpoint_type: 'E1',
    s3_endpoint: s3Endpoint,
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

const errorMock = [{ reason: 'An error occurred.' }];

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

    queryMocks.useAllQuotasQuery.mockReturnValue({
      data: quotasMock,
      isFetching: false,
    });

    const { findByText } = renderWithTheme(
      <EndpointSummaryRow endpoint={objectStorageEndpointMock} />
    );

    expect(await findByText(s3Endpoint)).toBeVisible();
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

    queryMocks.useAllQuotasQuery.mockReturnValue({
      isFetching: false,
      isError: true,
      error: errorMock,
    });

    const { findByText } = renderWithTheme(
      <EndpointSummaryRow endpoint={objectStorageEndpointMock} />
    );

    expect(
      await findByText(
        `There was an error retrieving ${s3Endpoint} endpoint data.`
      )
    ).toBeVisible();
  });

  it('should display data not available if any usage request has failed', async () => {
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

    queryMocks.useAllQuotasQuery.mockReturnValue({
      data: quotasMock,
      isFetching: false,
    });

    const { findAllByText } = renderWithTheme(
      <EndpointSummaryRow endpoint={objectStorageEndpointMock} />
    );

    const notAvailable = await findAllByText('Data not available');
    expect(notAvailable.length).toEqual(1);
  });
});
