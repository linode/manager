import { screen } from '@testing-library/react';
import * as React from 'react';

import { objectStorageBucketFactory } from 'src/factories/objectStorage';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AccessKeyDrawer, getDefaultScopes } from './AccessKeyDrawer';
import { getUpdatedScopes } from './AccessTable';

import type { AccessKeyDrawerProps } from './AccessKeyDrawer';
import type { MODE } from './types';
import type { ObjectStorageKeyBucketAccess } from '@linode/api-v4/lib/object-storage/types';

describe('AccessKeyDrawer', () => {
  const props: AccessKeyDrawerProps = {
    isRestrictedUser: false,
    mode: 'creating' as MODE,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
    open: true,
  };
  renderWithTheme(<AccessKeyDrawer {...props} />);
  it('renders without crashing', () => {
    expect(screen.getByTestId('drawer-title')).toBeInTheDocument();
  });

  describe('default scopes helper method', () => {
    const mockBuckets = objectStorageBucketFactory.buildList(5);
    it('should return an item for each bucket', () => {
      expect(getDefaultScopes(mockBuckets)).toHaveLength(mockBuckets.length);
    });

    it('should return objects with the correct shape', () => {
      const bucket = mockBuckets[0];
      expect(getDefaultScopes([bucket])[0]).toEqual({
        bucket_name: bucket.label,
        cluster: bucket.cluster,
        permissions: 'none',
        region: 'us-east',
      });
    });

    it('should sort the permissions by cluster', () => {
      const usaBucket = objectStorageBucketFactory.build({
        cluster: 'us-east-1',
      });
      const germanBucket = objectStorageBucketFactory.build({
        cluster: 'eu-central-1',
      });
      const asiaBucket = objectStorageBucketFactory.build({
        cluster: 'ap-south-1',
      });
      const unsortedBuckets = [usaBucket, germanBucket, asiaBucket];
      expect(
        getDefaultScopes(unsortedBuckets).map((scope) => scope.cluster)
      ).toEqual(['ap-south-1', 'eu-central-1', 'us-east-1']);
    });
  });

  describe('Updating scopes', () => {
    const mockBuckets = objectStorageBucketFactory.buildList(3);

    const mockScopes = getDefaultScopes(mockBuckets);

    it('should update the correct scope', () => {
      const newScope = {
        ...mockScopes[2],
        permissions: 'read_write',
      } as ObjectStorageKeyBucketAccess;
      expect(getUpdatedScopes(mockScopes, newScope)[2]).toHaveProperty(
        'permissions',
        'read_write'
      );
    });

    it('should leave other scopes unchanged', () => {
      const newScope = {
        ...mockScopes[2],
        access: 'read_write',
      } as ObjectStorageKeyBucketAccess;
      const updatedScopes = getUpdatedScopes(mockScopes, newScope);
      expect(updatedScopes[0]).toEqual(mockScopes[0]);
      expect(updatedScopes[1]).toEqual(mockScopes[1]);
      expect(updatedScopes.length).toEqual(mockScopes.length);
    });

    it('should handle crappy input', () => {
      const newScope = {
        bucket_name: 'not-real',
        cluster: 'totally-fake',
        permissions: 'read_only',
        region: 'us-east',
      } as ObjectStorageKeyBucketAccess;
      expect(getUpdatedScopes(mockScopes, newScope)).toEqual(mockScopes);
    });
  });
});
