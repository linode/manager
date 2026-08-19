import { readableBytes } from '@akamai/compute-ui-core/api';
import { formatDate } from '@akamai/compute-ui-core/datetime';
import { truncateMiddle } from '@akamai/compute-ui-core/formatting';
import { profileFactory, regionFactory } from '@linode/utilities';
import { screen, waitFor } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

import {
  objectStorageBucketFactory,
  objectStorageBucketFactoryGen2,
} from 'src/factories';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { BucketDetailsDrawer } from './BucketDetailsDrawer';

// Mock utility functions
vi.mock('@akamai/compute-ui-core/api', async () => {
  const actual = await vi.importActual('@akamai/compute-ui-core/api');
  return {
    ...actual,
    readableBytes: vi.fn(),
  };
});
vi.mock('@akamai/compute-ui-core/formatting', async () => {
  const actual = await vi.importActual('@akamai/compute-ui-core/formatting');
  return {
    ...actual,
    truncateMiddle: vi.fn(),
  };
});
vi.mock('@akamai/compute-ui-core/datetime', async () => {
  const actual = await vi.importActual('@akamai/compute-ui-core/datetime');
  return {
    ...actual,
    formatDate: vi.fn(),
  };
});

// Hoist query mocks
const queryMocks = vi.hoisted(() => ({
  useProfile: vi.fn().mockReturnValue({}),
  useRegionQuery: vi.fn().mockReturnValue({}),
  useRegionsQuery: vi.fn().mockReturnValue({}),
  useObjectStorageBucket: vi.fn().mockReturnValue({}),
}));

// Mock the queries
vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useRegionQuery: queryMocks.useRegionQuery,
    useRegionsQuery: queryMocks.useRegionsQuery,
    useProfile: queryMocks.useProfile,
    useObjectStorageBucket: queryMocks.useObjectStorageBucket,
  };
});

vi.mock('../hooks/useObjectStorageBucket', async () => {
  const actual = await vi.importActual('../hooks/useObjectStorageBucket');
  return {
    ...actual,
    useObjectStorageBucket: queryMocks.useObjectStorageBucket,
  };
});

const mockOnClose = vi.fn();

describe('BucketDetailsDrawer: Gen1 endpoint', () => {
  const region = regionFactory.build();

  const bucket = objectStorageBucketFactory.build({
    region: region.id,
  });

  beforeEach(() => {
    vi.resetAllMocks();
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({ timezone: 'UTC' }),
      isLoading: false,
    });
    queryMocks.useRegionQuery.mockReturnValue({
      data: region,
      isLoading: false,
    });
    queryMocks.useObjectStorageBucket.mockReturnValue({
      bucket,
      isLoading: false,
    });

    // These utils are used in the component
    vi.mocked(formatDate).mockReturnValue('2019-12-12');
    vi.mocked(truncateMiddle).mockImplementation((str) => str);
    vi.mocked(readableBytes).mockReturnValue({
      formatted: '1 MB',
      unit: 'MB',
      value: 1,
    });
  });

  it('renders correctly when open', async () => {
    renderWithThemeAndHookFormContext({
      component: (
        <BucketDetailsDrawer
          bucketName={bucket.label}
          isOpen={true}
          onClose={mockOnClose}
          regionId={bucket.region}
        />
      ),
    });

    await waitFor(() => {
      expect(screen.getByText(bucket.label)).toBeInTheDocument();
      expect(screen.getByTestId('createdTime')).toHaveTextContent(
        'Created: 2019-12-12'
      );
      expect(screen.getByTestId('region')).toHaveTextContent(region.label);
      expect(screen.getByText(bucket.hostname)).toBeInTheDocument();
      expect(screen.getByText('1 MB')).toBeInTheDocument();
      expect(screen.getByText('103 objects')).toBeInTheDocument();
      screen.findByText('Access Control List (ACL)').then((element) => {
        expect(element).toBeInTheDocument();
      });
    });
  });

  it('handles undefined selectedBucket gracefully', () => {
    queryMocks.useRegionQuery.mockReturnValue({ data: undefined });
    queryMocks.useObjectStorageBucket.mockReturnValue({ bucket: undefined });

    renderWithThemeAndHookFormContext({
      component: (
        <BucketDetailsDrawer
          bucketName={undefined}
          isOpen={true}
          onClose={mockOnClose}
          regionId={undefined}
        />
      ),
    });

    expect(screen.getByText('Bucket Details')).toBeInTheDocument();
    expect(screen.queryByTestId('createdTime')).not.toBeInTheDocument();
    expect(screen.queryByTestId('region')).not.toBeInTheDocument();
  });

  it("doesn't show the CORS switch for E2 and E3 buckets", async () => {
    const gen2Bucket = objectStorageBucketFactoryGen2.build({
      region: region.id,
    });
    queryMocks.useRegionQuery.mockReturnValue({ data: region });
    queryMocks.useObjectStorageBucket.mockReturnValue({ bucket: gen2Bucket });

    const { getByText } = renderWithThemeAndHookFormContext({
      component: (
        <BucketDetailsDrawer
          bucketName={gen2Bucket.label}
          isOpen={true}
          onClose={mockOnClose}
          regionId={gen2Bucket.region}
        />
      ),
    });

    expect(
      getByText(
        /CORS \(Cross Origin Sharing\) is not available for endpoint types E2 and E3./
      )
    ).toBeInTheDocument();
  });
});
