import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import * as React from 'react';
import { QueryClient } from 'react-query';
import {
  objectStorageBucketFactory,
  objectStorageClusterFactory,
} from 'src/factories/objectStorage';
import { preferencesFactory } from 'src/factories/preferences';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { rest, server } from 'src/mocks/testServer';
import { queryPresets } from 'src/queries/base';
import { renderWithTheme } from 'src/utilities/testHelpers';
import BucketLanding, { CombinedProps } from './BucketLanding';

const mockCloseBucketDrawer = jest.fn();
const mockOpenBucketDrawer = jest.fn();

const props: CombinedProps = {
  isRestrictedUser: false,
  openBucketDrawer: mockOpenBucketDrawer,
  closeBucketDrawer: mockCloseBucketDrawer,
  getUserPreferences: jest.fn(),
  updateUserPreferences: jest.fn(),
  preferences: preferencesFactory.build(),
};

const queryClient = new QueryClient({
  defaultOptions: { queries: queryPresets.oneTimeFetch },
});

afterEach(() => {
  queryClient.clear();
});

describe('ObjectStorageLanding', () => {
  it('renders a loading state', () => {
    // Mock Buckets
    server.use(
      rest.get('*/object-storage/buckets', (req, res, ctx) => {
        return res(ctx.json(makeResourcePage([])));
      })
    );

    renderWithTheme(<BucketLanding {...props} />);

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

    renderWithTheme(<BucketLanding {...props} />, { queryClient });

    await waitForElementToBeRemoved(screen.getByTestId('circle-progress'));

    screen.getByTestId('placeholder-button');
  });

  it('renders per-cluster errors', async () => {
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

    renderWithTheme(<BucketLanding {...props} />, { queryClient });

    await waitForElementToBeRemoved(screen.getByTestId('circle-progress'));

    screen.getByText(/^There was an error loading buckets in us-west/);
  });

  it('renders general error state', async () => {
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
    renderWithTheme(<BucketLanding {...props} />, { queryClient });

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

    renderWithTheme(<BucketLanding {...props} />, { queryClient });

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

    renderWithTheme(<BucketLanding {...props} />, { queryClient });

    await waitForElementToBeRemoved(screen.getByTestId('circle-progress'));

    screen.getByText(/Total storage used: 10 GB/);
  });
});
