import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import * as React from 'react';
import { QueryClient } from 'react-query';
import {
  objectStorageBucketFactory,
  objectStorageClusterFactory,
} from 'src/factories/objectStorage';
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
      rest.get('*/object-storage/buckets', (req, res, ctx) => {
        return res(ctx.json(makeResourcePage([])));
      })
    );

    renderWithTheme(<BucketLanding {...props} />, { queryClient });

    await waitForElementToBeRemoved(screen.getByTestId('circle-progress'));

    screen.getByTestId('placeholder-button');
  });

  // @todo skipping right now, need to decide if i want to do per-cluster fetching
  it.skip('renders per-cluster errors', () => {
    renderWithTheme(<BucketLanding {...props} />, {
      customStore: {
        __resources: {
          buckets: {
            loading: false,
            lastUpdated: 1,
            bucketErrors: [
              {
                clusterId: 'us-east-1',
                error: { reason: 'An error occurred' },
              },
            ],
          },
        },
      },
    });
    screen.getByText(/^There was an error loading buckets in Newark, NJ/);
  });

  // @todo skipping right now, need to decide if i want to do per-cluster fetching
  it.skip('renders general error state', () => {
    renderWithTheme(<BucketLanding {...props} />, {
      customStore: {
        __resources: {
          buckets: {
            loading: false,
            lastUpdated: 1,
            bucketErrors: [
              {
                clusterId: 'us-east-1',
                error: { reason: 'An error occurred' },
              },
            ],
          },
          clusters: {
            entities: [objectStorageClusterFactory.build()],
          },
        },
      },
    });
    screen.getByText(/^There was an error retrieving your buckets/);
  });

  it('renders rows for each Bucket', async () => {
    const buckets = objectStorageBucketFactory.buildList(2);

    // Mock Buckets
    server.use(
      rest.get('*/object-storage/buckets', (req, res, ctx) => {
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

    // Mock Buckets
    server.use(
      rest.get('*/object-storage/buckets', (req, res, ctx) => {
        return res(ctx.json(makeResourcePage(buckets)));
      })
    );

    renderWithTheme(<BucketLanding {...props} />, { queryClient });

    await waitForElementToBeRemoved(screen.getByTestId('circle-progress'));

    screen.getByText(/Total storage used: 10 GB/);
  });
});
