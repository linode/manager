import { screen } from '@testing-library/react';
import * as React from 'react';
import {
  objectStorageBucketFactory,
  objectStorageClusterFactory
} from 'src/factories/objectStorage';
import { renderWithTheme } from 'src/utilities/testHelpers';
import BucketLanding, { CombinedProps } from './BucketLanding';

const mockCloseBucketDrawer = jest.fn();
const mockOpenBucketDrawer = jest.fn();

const props: CombinedProps = {
  isRestrictedUser: false,
  openBucketDrawer: mockOpenBucketDrawer,
  closeBucketDrawer: mockCloseBucketDrawer
};

describe('ObjectStorageLanding', () => {
  it('renders a loading state', () => {
    renderWithTheme(<BucketLanding {...props} />);
    screen.getByTestId('circle-progress');
  });

  it('renders an empty state', () => {
    renderWithTheme(<BucketLanding {...props} />, {
      customStore: { __resources: { buckets: { data: [], lastUpdated: 1 } } }
    });
    screen.getByTestId('placeholder-button');
  });

  it('renders per-cluster errors', () => {
    renderWithTheme(<BucketLanding {...props} />, {
      customStore: {
        __resources: {
          buckets: {
            loading: false,
            lastUpdated: 1,
            bucketErrors: [
              { clusterId: 'us-east-1', error: { reason: 'An error occurred' } }
            ]
          }
        }
      }
    });
    screen.getByText(/^There was an error loading buckets in Newark, NJ/);
  });

  it('renders general error state', () => {
    renderWithTheme(<BucketLanding {...props} />, {
      customStore: {
        __resources: {
          buckets: {
            loading: false,
            lastUpdated: 1,
            bucketErrors: [
              { clusterId: 'us-east-1', error: { reason: 'An error occurred' } }
            ]
          },
          clusters: {
            entities: [objectStorageClusterFactory.build()]
          }
        }
      }
    });
    screen.getByText(/^There was an error retrieving your buckets/);
  });

  it('renders rows for each Bucket', () => {
    const buckets = objectStorageBucketFactory.buildList(2);
    renderWithTheme(<BucketLanding {...props} />, {
      customStore: {
        __resources: {
          buckets: { data: buckets, lastUpdated: 1 }
        }
      }
    });
    screen.getByText(buckets[0].label);
    screen.getByText(buckets[1].label);
  });

  it('renders a "Total usage" section if there is more than one Bucket', () => {
    renderWithTheme(<BucketLanding {...props} />, {
      customStore: {
        __resources: {
          buckets: {
            data: objectStorageBucketFactory.buildList(2, {
              size: 1024 * 1024 * 1024 * 5
            }),
            loading: false,
            lastUpdated: 1
          }
        }
      }
    });
    screen.getByText(/Total usage: 10 GB/);
  });
});
