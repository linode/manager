import { screen } from '@testing-library/react';
import * as React from 'react';

import {
  objectStorageBucketFactory,
  objectStorageClusterFactory,
} from 'src/factories/objectStorage';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { BucketLanding } from './BucketLanding';

describe('ObjectStorageLanding', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders a loading state', () => {
    // Mock Buckets
    server.use(
      http.get('*/object-storage/buckets', () => {
        return HttpResponse.json(makeResourcePage([]));
      })
    );

    renderWithTheme(<BucketLanding />);

    screen.getByTestId('circle-progress');
  });

  it('renders an empty state', async () => {
    // Mock Clusters
    server.use(
      http.get('*/object-storage/clusters', () => {
        const clusters = objectStorageClusterFactory.buildList(4);
        return HttpResponse.json(makeResourcePage(clusters));
      })
    );

    // Mock Buckets
    server.use(
      http.get('*/object-storage/buckets/*', () => {
        return HttpResponse.json(makeResourcePage([]));
      })
    );

    renderWithTheme(<BucketLanding />);

    await screen.findByTestId('placeholder-button');
  });

  it('renders per-cluster errors', async () => {
    objectStorageBucketFactory.resetSequenceNumber();
    objectStorageClusterFactory.resetSequenceNumber();

    const downCluster = objectStorageClusterFactory.build({
      region: 'us-west',
    });

    // Mock Clusters
    server.use(
      http.get('*/object-storage/clusters', () => {
        const upClusters = objectStorageClusterFactory.buildList(1, {
          region: 'ap-south-1',
        });
        return HttpResponse.json(
          makeResourcePage([downCluster, ...upClusters])
        );
      })
    );

    // Mock Buckets
    server.use(
      http.get(
        '*/object-storage/buckets/cluster-0',
        () => {
          return HttpResponse.json([{ reason: 'Cluster offline!' }], {
            status: 500,
          });
        },
        {
          once: true,
        }
      ),
      http.get('*/object-storage/buckets/*', () => {
        return HttpResponse.json(
          makeResourcePage(
            objectStorageBucketFactory.buildList(2, { cluster: 'ap-south-1' })
          )
        );
      })
    );

    renderWithTheme(<BucketLanding />);

    await screen.findByText(
      /^There was an error loading buckets in Fremont, CA/
    );
  });

  it('renders general error state', async () => {
    // Mock Clusters
    server.use(
      http.get('*/object-storage/clusters', () => {
        const clusters = objectStorageClusterFactory.buildList(1);
        return HttpResponse.json(makeResourcePage(clusters));
      })
    );

    // Mock Buckets
    server.use(
      http.get('*/object-storage/buckets/*', () => {
        return HttpResponse.json([{ reason: 'Cluster offline!' }], {
          status: 500,
        });
      })
    );
    renderWithTheme(<BucketLanding />);

    await screen.findByText(/^There was an error retrieving your buckets/);
  });

  it('renders rows for each Bucket', async () => {
    const buckets = objectStorageBucketFactory.buildList(2);

    // Mock Clusters
    server.use(
      http.get('*/object-storage/clusters', () => {
        const clusters = objectStorageClusterFactory.buildList(1);
        return HttpResponse.json(makeResourcePage(clusters));
      })
    );

    // Mock Buckets
    server.use(
      http.get('*/object-storage/buckets/*', () => {
        return HttpResponse.json(makeResourcePage(buckets));
      })
    );

    renderWithTheme(<BucketLanding />);

    await screen.findByText(buckets[0].label);
    await screen.findByText(buckets[1].label);
  });

  it('renders a "Total usage" section if there is more than one Bucket', async () => {
    const buckets = objectStorageBucketFactory.buildList(2, {
      size: 1024 * 1024 * 1024 * 5,
    });

    // Mock Clusters
    server.use(
      http.get('*/object-storage/clusters', () => {
        const clusters = objectStorageClusterFactory.buildList(1);
        return HttpResponse.json(makeResourcePage(clusters));
      })
    );

    // Mock Buckets
    server.use(
      http.get('*/object-storage/buckets/*', () => {
        return HttpResponse.json(makeResourcePage(buckets));
      })
    );

    renderWithTheme(<BucketLanding />);

    await screen.findByText(/Total storage used: 10 GB/);
  });
});
