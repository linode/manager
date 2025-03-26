import {
  readableBytes,
  regionFactory,
  truncateMiddle,
} from '@linode/utilities';
import { screen, waitFor } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

import {
  objectStorageBucketFactory,
  objectStorageBucketFactoryGen2,
  profileFactory,
} from 'src/factories';
import { formatDate } from 'src/utilities/formatDate';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { BucketDetailsDrawer } from './BucketDetailsDrawer';

// Mock utility functions
vi.mock('@linode/utilities', async () => {
  const actual = await vi.importActual('@linode/utilities');
  return {
    ...actual,
    readableBytes: vi.fn(),
    truncateMiddle: vi.fn(),
  };
});
vi.mock('src/utilities/formatDate');

// Hoist query mocks
const queryMocks = vi.hoisted(() => ({
  useObjectStorageClusters: vi.fn().mockReturnValue({}),
  useProfile: vi.fn().mockReturnValue({}),
  useRegionQuery: vi.fn().mockReturnValue({}),
  useRegionsQuery: vi.fn().mockReturnValue({}),
}));

// Mock the queries
vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
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

describe('BucketDetailDrawer: Gen2 UI', () => {
  const e3Bucket = objectStorageBucketFactoryGen2.build();

  const region = regionFactory.build({
    id: e3Bucket.region,
  });

  it('renders correctly when open', () => {
    renderWithThemeAndHookFormContext({
      component: (
        <BucketDetailsDrawer
          onClose={mockOnClose}
          open={true}
          selectedBucket={e3Bucket}
        />
      ),
      options: {
        flags: { objMultiCluster: false, objectStorageGen2: { enabled: true } },
      },
    });

    expect(screen.getByText(e3Bucket.label)).toBeInTheDocument();
    expect(screen.getByTestId('createdTime')).toHaveTextContent(
      'Created: 2019-12-12'
    );
    expect(screen.getByTestId('endpointType')).toHaveTextContent(
      `Endpoint Type: E3`
    );
    expect(screen.getByTestId('cluster')).toHaveTextContent(region.id);
    expect(screen.getByText(e3Bucket.hostname)).toBeInTheDocument();
    expect(screen.getByText('1 MB')).toBeInTheDocument();
    expect(screen.getByText('103 objects')).toBeInTheDocument();
  });

  it("doesn't show the CORS switch for E2 and E3 buckets", async () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: (
        <BucketDetailsDrawer
          onClose={mockOnClose}
          open={true}
          selectedBucket={e3Bucket}
        />
      ),
      options: {
        flags: { objMultiCluster: false, objectStorageGen2: { enabled: true } },
      },
    });

    expect(
      getByText(
        /CORS \(Cross Origin Sharing\) is not available for endpoint types E2 and E3./
      )
    ).toBeInTheDocument();
  });
});
