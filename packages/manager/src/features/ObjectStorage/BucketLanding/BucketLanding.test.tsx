import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import * as React from 'react';
import { QueryClient, setLogger } from 'react-query';

import {
  objectStorageBucketFactory,
  objectStorageClusterFactory,
} from 'src/factories/objectStorage';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { rest, server } from 'src/mocks/testServer';
import { queryPresets } from 'src/queries/base';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { BucketLanding } from './BucketLanding';

const queryClient = new QueryClient({
  defaultOptions: { queries: queryPresets.oneTimeFetch },
});

describe('ObjectStorageLanding', () => {
  afterEach(() => {
    queryClient.clear();
    // If necessary, reset React Query logger.
    setLogger(console);
  });

  it('renders a loading state', () => {
    // Mock Buckets
    server.use(
      rest.get('*/object-storage/buckets', (req, res, ctx) => {
        return res(ctx.json(makeResourcePage([])));
      })
    );

    renderWithTheme(<BucketLanding />);

    screen.getByTestId('circle-progress');
  });

  it('renders an empty state', async () => {
    // Mock Clusters
    server.use(
      rest.get('*/object-storage/clusters', (req, res, ctx) => {
        const clusters = objectStorageClusterFactory.buildList(4);
        return res(ctx.json(makeResourcePage(clusters)));
      })
    );

    // Mock Buckets
    server.use(
      rest.get('*/object-storage/buckets/*', (req, res, ctx) => {
        return res(ctx.json(makeResourcePage([])));
      })
    );

    renderWithTheme(<BucketLanding />, { queryClient });

    await waitForElementToBeRemoved(screen.getByTestId('circle-progress'));

    screen.getByTestId('placeholder-button');
  });

  it('renders per-cluster errors', async () => {
    // Suppress logging React Query errors to CLI since this test is expected
    // to trigger errors.
    //
    // Note: Logging options improved in React Query v4 and `setLogger` will
    // be removed in v5. We will be able to accomplish this more cleanly once
    // we upgrade.
    //
    // See also:
    // - https://github.com/TanStack/query/issues/125
    // - https://github.com/TanStack/query/discussions/4252
    setLogger({
      log: () => {},
      warn: () => {},
      error: () => {},
    });

    objectStorageBucketFactory.resetSequenceNumber();
    objectStorageClusterFactory.resetSequenceNumber();

    const downCluster = objectStorageClusterFactory.build({
      region: 'us-west',
    });

    // Mock Clusters
    server.use(
      rest.get('*/object-storage/clusters', (req, res, ctx) => {
        const upClusters = objectStorageClusterFactory.buildList(1, {
          region: 'ap-south-1',
        });
        return res(ctx.json(makeResourcePage([downCluster, ...upClusters])));
      })
    );

    // Mock Buckets
    server.use(
      rest.get('*/object-storage/buckets/cluster-0', (req, res, ctx) => {
        return res.once(
          ctx.status(500),
          ctx.json([{ reason: 'Cluster offline!' }])
        );
      }),
      rest.get('*/object-storage/buckets/*', (req, res, ctx) => {
        return res(
          ctx.json(
            makeResourcePage(
              objectStorageBucketFactory.buildList(2, { cluster: 'ap-south-1' })
            )
          )
        );
      })
    );

    renderWithTheme(<BucketLanding />, { queryClient });

    await waitForElementToBeRemoved(screen.getByTestId('circle-progress'));

    screen.getByText(/^There was an error loading buckets in Fremont, CA/);
  });

  it('renders general error state', async () => {
    // Suppress logging React Query errors to CLI since this test is expected
    // to trigger errors.
    //
    // Note: Logging options improved in React Query v4 and `setLogger` will
    // be removed in v5. We will be able to accomplish this more cleanly once
    // we upgrade.
    //
    // See also:
    // - https://github.com/TanStack/query/issues/125
    // - https://github.com/TanStack/query/discussions/4252
    setLogger({
      log: () => {},
      warn: () => {},
      error: () => {},
    });

    // Mock Clusters
    server.use(
      rest.get('*/object-storage/clusters', (req, res, ctx) => {
        const clusters = objectStorageClusterFactory.buildList(1);
        return res(ctx.json(makeResourcePage(clusters)));
      })
    );

    // Mock Buckets
    server.use(
      rest.get('*/object-storage/buckets/*', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json([{ reason: 'Cluster offline!' }]));
      })
    );
    renderWithTheme(<BucketLanding />, { queryClient });

    await waitForElementToBeRemoved(screen.getByTestId('circle-progress'));

    screen.getByText(/^There was an error retrieving your buckets/);
  });

  it('renders rows for each Bucket', async () => {
    const buckets = objectStorageBucketFactory.buildList(2);

    // Mock Clusters
    server.use(
      rest.get('*/object-storage/clusters', (req, res, ctx) => {
        const clusters = objectStorageClusterFactory.buildList(1);
        return res(ctx.json(makeResourcePage(clusters)));
      })
    );

    // Mock Buckets
    server.use(
      rest.get('*/object-storage/buckets/*', (req, res, ctx) => {
        return res(ctx.json(makeResourcePage(buckets)));
      })
    );

    renderWithTheme(<BucketLanding />, { queryClient });

    await waitForElementToBeRemoved(screen.getByTestId('circle-progress'));

    screen.getByText(buckets[0].label);
    screen.getByText(buckets[1].label);
  });

  it('renders a "Total usage" section if there is more than one Bucket', async () => {
    const buckets = objectStorageBucketFactory.buildList(2, {
      size: 1024 * 1024 * 1024 * 5,
    });

    // Mock Clusters
    server.use(
      rest.get('*/object-storage/clusters', (req, res, ctx) => {
        const clusters = objectStorageClusterFactory.buildList(1);
        return res(ctx.json(makeResourcePage(clusters)));
      })
    );

    // Mock Buckets
    server.use(
      rest.get('*/object-storage/buckets/*', (req, res, ctx) => {
        return res(ctx.json(makeResourcePage(buckets)));
      })
    );

    renderWithTheme(<BucketLanding />, { queryClient });

    await waitForElementToBeRemoved(screen.getByTestId('circle-progress'));

    screen.getByText(/Total storage used: 10 GB/);
  });
});
