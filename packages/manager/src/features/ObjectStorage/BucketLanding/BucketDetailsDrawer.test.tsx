import { screen, waitFor } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

import {
  objectStorageBucketFactory,
  profileFactory,
  regionFactory,
} from 'src/factories';
import { formatDate } from 'src/utilities/formatDate';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';
import { truncateMiddle } from 'src/utilities/truncate';
import { readableBytes } from 'src/utilities/unitConversions';

import { BucketDetailsDrawer } from './BucketDetailsDrawer';

// Mock utility functions
vi.mock('src/utilities/formatDate');
vi.mock('src/utilities/truncate');
vi.mock('src/utilities/unitConversions');

// Hoist query mocks
const queryMocks = vi.hoisted(() => ({
  useObjectStorageClusters: vi.fn().mockReturnValue({}),
  useProfile: vi.fn().mockReturnValue({}),
  useRegionQuery: vi.fn().mockReturnValue({}),
  useRegionsQuery: vi.fn().mockReturnValue({}),
}));

// Mock the queries
vi.mock('src/queries/profile/profile', async () => {
  const actual = await vi.importActual('src/queries/profile/profile');
  return {
    ...actual,
    useProfile: queryMocks.useProfile,
  };
});

vi.mock('src/queries/regions/regions', async () => {
  const actual = await vi.importActual('src/queries/regions/regions');
  return {
    ...actual,
    useRegionQuery: queryMocks.useRegionQuery,
    useRegionsQuery: queryMocks.useRegionsQuery,
  };
});

vi.mock('src/queries/object-storage/queries', async () => {
  const actual = await vi.importActual('src/queries/object-storage/queries');
  return {
    ...actual,
    useObjectStorageClusters: queryMocks.useObjectStorageClusters,
  };
});

const mockOnClose = vi.fn();

describe('BucketDetailsDrawer: Legacy UI', () => {
  const bucket = objectStorageBucketFactory.build();
  const region = regionFactory.build({
    id: bucket.region,
  });

  beforeEach(() => {
    vi.resetAllMocks();
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({ timezone: 'UTC' }),
    });
    queryMocks.useRegionQuery.mockReturnValue({ data: region });
    queryMocks.useRegionsQuery.mockReturnValue({ data: [region] });
    queryMocks.useObjectStorageClusters.mockReturnValue({ data: [] });

    // These utils are used in the component
    vi.mocked(formatDate).mockReturnValue('2019-12-12');
    vi.mocked(truncateMiddle).mockImplementation((str) => str);
    vi.mocked(readableBytes).mockReturnValue({
      formatted: '1 MB',
      unit: 'MB',
      value: 1,
    });
  });

  it('renders correctly when open', () => {
    renderWithThemeAndHookFormContext({
      component: (
        <BucketDetailsDrawer
          onClose={mockOnClose}
          open={true}
          selectedBucket={bucket}
        />
      ),
      options: {
        flags: { objMultiCluster: false },
      },
    });

    expect(screen.getByText(bucket.label)).toBeInTheDocument();
    expect(screen.getByTestId('createdTime')).toHaveTextContent(
      'Created: 2019-12-12'
    );
    expect(screen.getByTestId('cluster')).toHaveTextContent(region.id);
    expect(screen.getByText(bucket.hostname)).toBeInTheDocument();
    expect(screen.getByText('1 MB')).toBeInTheDocument();
    expect(screen.getByText('103 objects')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    renderWithThemeAndHookFormContext({
      component: (
        <BucketDetailsDrawer
          onClose={mockOnClose}
          open={false}
          selectedBucket={bucket}
        />
      ),
      options: {
        flags: { objMultiCluster: false },
      },
    });

    expect(screen.queryByText(bucket.label)).not.toBeInTheDocument();
  });

  it('renders correctly with objMultiCluster disabled', () => {
    renderWithThemeAndHookFormContext({
      component: (
        <BucketDetailsDrawer
          onClose={mockOnClose}
          open={true}
          selectedBucket={bucket}
        />
      ),
      options: {
        flags: { objMultiCluster: false },
      },
    });

    expect(screen.getByTestId('cluster')).toHaveTextContent(region.id);
  });

  it('handles undefined selectedBucket gracefully', () => {
    renderWithThemeAndHookFormContext({
      component: (
        <BucketDetailsDrawer
          onClose={mockOnClose}
          open={true}
          selectedBucket={undefined}
        />
      ),
      options: {
        flags: { objMultiCluster: false },
      },
    });

    expect(screen.getByText('Bucket Detail')).toBeInTheDocument();
    expect(screen.queryByTestId('createdTime')).not.toBeInTheDocument();
    expect(screen.queryByTestId('cluster')).not.toBeInTheDocument();
  });

  it('renders AccessSelect when cluster and bucketLabel are available', async () => {
    renderWithThemeAndHookFormContext({
      component: (
        <BucketDetailsDrawer
          onClose={mockOnClose}
          open={true}
          selectedBucket={bucket}
        />
      ),
      options: {
        flags: { objMultiCluster: false },
      },
    });

    await waitFor(() => {
      expect(
        screen.queryByLabelText('Access Control List (ACL)')
      ).toBeInTheDocument();
    });
  });

  it('does not render AccessSelect when cluster or bucketLabel is missing', async () => {
    const bucketWithoutCluster = { ...bucket, cluster: '' };
    renderWithThemeAndHookFormContext({
      component: (
        <BucketDetailsDrawer
          onClose={mockOnClose}
          open={true}
          selectedBucket={bucketWithoutCluster}
        />
      ),
      options: {
        flags: { objMultiCluster: false },
      },
    });

    await waitFor(() => {
      expect(
        screen.queryByLabelText('Access Control List (ACL)')
      ).not.toBeInTheDocument();
    });
  });
});
