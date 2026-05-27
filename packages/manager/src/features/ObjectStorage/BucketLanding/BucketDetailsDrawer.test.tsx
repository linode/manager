import { formatDate } from '@akamai/compute-ui-core/datetime';
import { truncateMiddle } from '@akamai/compute-ui-core/formatting';
import {
  profileFactory,
  readableBytes,
  regionFactory,
} from '@linode/utilities';
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
vi.mock('@linode/utilities', async () => {
  const actual = await vi.importActual('@linode/utilities');
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
}));

// Mock the queries
vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useProfile: queryMocks.useProfile,
  };
});

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useRegionQuery: queryMocks.useRegionQuery,
    useRegionsQuery: queryMocks.useRegionsQuery,
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
    });
    queryMocks.useRegionQuery.mockReturnValue({ data: region });

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
          bucket={bucket}
          isOpen={true}
          onClose={mockOnClose}
        />
      ),
    });

    expect(screen.getByText(bucket.label)).toBeInTheDocument();
    expect(screen.getByTestId('createdTime')).toHaveTextContent(
      'Created: 2019-12-12'
    );
    expect(screen.getByTestId('region')).toHaveTextContent(region.label);
    expect(screen.getByText(bucket.hostname)).toBeInTheDocument();
    expect(screen.getByText('1 MB')).toBeInTheDocument();
    expect(screen.getByText('103 objects')).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.queryByLabelText('Access Control List (ACL)')
      ).toBeInTheDocument();
    });
  });

  it('does not render when closed', () => {
    renderWithThemeAndHookFormContext({
      component: (
        <BucketDetailsDrawer
          bucket={bucket}
          isOpen={false}
          onClose={mockOnClose}
        />
      ),
    });

    expect(screen.queryByText(bucket.label)).not.toBeInTheDocument();
  });

  it('handles undefined selectedBucket gracefully', () => {
    queryMocks.useRegionQuery.mockReturnValue({ data: undefined });

    renderWithThemeAndHookFormContext({
      component: (
        <BucketDetailsDrawer
          bucket={undefined}
          isOpen={true}
          onClose={mockOnClose}
        />
      ),
    });

    expect(screen.getByText('Bucket Detail')).toBeInTheDocument();
    expect(screen.queryByTestId('createdTime')).not.toBeInTheDocument();
    expect(screen.queryByTestId('region')).toHaveTextContent('');
  });

  it("doesn't show the CORS switch for E2 and E3 buckets", async () => {
    const gen2Bucket = objectStorageBucketFactoryGen2.build({
      region: region.id,
    });
    queryMocks.useRegionQuery.mockReturnValue({ data: region });

    const { getByText } = renderWithThemeAndHookFormContext({
      component: (
        <BucketDetailsDrawer
          bucket={gen2Bucket}
          isOpen={true}
          onClose={mockOnClose}
        />
      ),
      options: {
        flags: { objectStorageGen2: { enabled: true } },
      },
    });

    expect(
      getByText(
        /CORS \(Cross Origin Sharing\) is not available for endpoint types E2 and E3./
      )
    ).toBeInTheDocument();
  });
});
