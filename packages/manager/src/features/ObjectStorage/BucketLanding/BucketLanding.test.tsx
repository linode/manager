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
    const { getByTestId } = renderWithTheme(<BucketLanding {...props} />);
    getByTestId('circle-progress');
  });

  it('renders an empty state', () => {
    const { getByTestId } = renderWithTheme(<BucketLanding {...props} />, {
      customStore: { __resources: { buckets: { data: [], lastUpdated: 1 } } }
    });
    getByTestId('placeholder-button');
  });

  it('renders per-cluster errors', () => {
    const { getByText } = renderWithTheme(<BucketLanding {...props} />, {
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
    getByText(/^There was an error loading buckets in Newark, NJ/);
  });

  it('renders general error state', () => {
    const { getByText } = renderWithTheme(<BucketLanding {...props} />, {
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
    getByText(/^There was an error retrieving your buckets/);
  });

  it('renders rows for each Bucket', () => {
    const buckets = objectStorageBucketFactory.buildList(2);
    const { getByText } = renderWithTheme(<BucketLanding {...props} />, {
      customStore: {
        __resources: {
          buckets: { data: buckets, lastUpdated: 1 }
        }
      }
    });
    getByText(buckets[0].label);
    getByText(buckets[1].label);
  });
});
