import { screen } from '@testing-library/react';
import * as React from 'react';
import { objectStorageBucketFactory } from 'src/factories/objectStorage';
import { renderWithTheme } from 'src/utilities/testHelpers';
import {
  AccessKeyDrawer,
  getDefaultScopes,
  MODES,
  Props
} from './AccessKeyDrawer';

describe('AccessKeyDrawer', () => {
  const props: Props = {
    open: true,
    onSubmit: jest.fn(),
    onClose: jest.fn(),
    mode: 'creating' as MODES,
    isRestrictedUser: false
  };
  renderWithTheme(<AccessKeyDrawer {...props} />);
  it('renders without crashing', () => {
    expect(screen.getByText(/create an access key/i)).toBeInTheDocument();
  });

  describe('default scopes helper method', () => {
    const mockBuckets = objectStorageBucketFactory.buildList(5);
    it('should return an item for each bucket', () => {
      expect(getDefaultScopes(mockBuckets)).toHaveLength(mockBuckets.length);
    });

    it('should return objects with the correct shape', () => {
      const bucket = mockBuckets[0];
      expect(getDefaultScopes([bucket])[0]).toEqual({
        cluster: bucket.cluster,
        bucket: bucket.label,
        access: 'none'
      });
    });

    it('should sort the permissions by cluster', () => {
      const usaBucket = objectStorageBucketFactory.build({
        cluster: 'us-east-1'
      });
      const germanBucket = objectStorageBucketFactory.build({
        cluster: 'eu-central-1'
      });
      const asiaBucket = objectStorageBucketFactory.build({
        cluster: 'ap-south-1'
      });
      const unsortedBuckets = [usaBucket, germanBucket, asiaBucket];
      expect(
        getDefaultScopes(unsortedBuckets).map(scope => scope.cluster)
      ).toEqual(['ap-south-1', 'eu-central-1', 'us-east-1']);
    });
  });
});
