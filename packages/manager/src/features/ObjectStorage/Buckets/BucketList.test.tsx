import { regionFactory } from '@linode/utilities';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import * as React from 'react';

import { objectStorageBucketFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { BucketList } from './BucketList';

const mocks = vi.hoisted(() => ({
  useObjectStorageRegions: vi.fn(),
  useObjectStorageRegionsWithAssignedEndpoints: vi.fn(),
  useObjectStorageBuckets: vi.fn(),
  useBucketDrawers: vi.fn(),
}));

vi.mock(
  'src/features/ObjectStorage/shared/hooks/useObjectStorageRegions',
  () => ({
    useObjectStorageRegions: mocks.useObjectStorageRegions,
  })
);

vi.mock(
  'src/features/ObjectStorage/shared/hooks/useObjectStorageRegionsWithAssignedEndpoints',
  () => ({
    useObjectStorageRegionsWithAssignedEndpoints:
      mocks.useObjectStorageRegionsWithAssignedEndpoints,
  })
);

vi.mock('./hooks/useObjectStorageBuckets', () => ({
  useObjectStorageBuckets: mocks.useObjectStorageBuckets,
}));

vi.mock('./hooks/useBucketDrawers', () => ({
  useBucketDrawers: mocks.useBucketDrawers,
}));

// Keep these children lightweight.
vi.mock('./Filters/BucketFilters', () => ({
  BucketFilters: (props: { onFiltersChange: (x: any) => void }) => (
    <button
      onClick={() =>
        props.onFiltersChange({
          regionIdsFilter: new Set(['us-east']),
          endpointsFilter: null,
        })
      }
    >
      filters
    </button>
  ),
}));

vi.mock('./Table/BucketTable', () => ({
  BucketTable: (props: {
    data: any[];
    handleClickDetails: (b: any) => void;
    handleClickRemove: (b: any) => void;
  }) => (
    <div>
      {props.data.map((b) => (
        <div key={b.label}>
          <span>{b.label}</span>
          <button onClick={() => props.handleClickDetails(b)}>details</button>
          <button onClick={() => props.handleClickRemove(b)}>remove</button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock('./DeleteBucket/BucketDeletionDialog', () => ({
  BucketDeletionDialogWithRef: React.forwardRef((_, ref) => {
    React.useImperativeHandle(ref, () => ({
      open: vi.fn(),
      close: vi.fn(),
    }));
    return <div data-testid="deletion-dialog" />;
  }),
}));

describe('BucketList', () => {
  /**
   * BucketList waits for the first onFiltersChange emit before rendering the buckets.
   * Our BucketFilters mock exposes a single "filters" button that triggers that emit.
   */
  const emitFiltersChange = () => {
    fireEvent.click(screen.getByRole('button', { name: 'filters' }));
  };

  const defaultBucketsReturn = {
    data: [
      objectStorageBucketFactory.build({
        label: 'bucket-1',
        region: 'us-east',
      }),
    ],
    failedRegionIds: [],
    isLoading: false,
  };

  beforeEach(() => {
    vi.resetAllMocks();

    const regions = regionFactory.buildList(2);

    mocks.useObjectStorageRegions.mockReturnValue({
      regionsByIdMap: Object.fromEntries(regions.map((r) => [r.id, r])),
    });

    mocks.useObjectStorageRegionsWithAssignedEndpoints.mockReturnValue({
      objectStorageEndpoints: [],
      isLoading: false,
      isError: false,
    });

    mocks.useBucketDrawers.mockReturnValue({ openDrawer: vi.fn() });

    mocks.useObjectStorageBuckets.mockReturnValue(defaultBucketsReturn);
  });

  it('renders buckets and total usage when more than one filtered bucket', async () => {
    const regions = regionFactory.buildList(1);
    mocks.useObjectStorageRegions.mockReturnValue({
      regionsByIdMap: Object.fromEntries(regions.map((r) => [r.id, r])),
    });
    mocks.useObjectStorageBuckets.mockReset();
    mocks.useObjectStorageBuckets.mockReturnValue({
      data: [
        objectStorageBucketFactory.build({
          label: 'bucket-a',
          region: regions[0].id,
          size: 1,
        }),
        objectStorageBucketFactory.build({
          label: 'bucket-b',
          region: regions[0].id,
          size: 2,
        }),
      ],
      failedRegionIds: [],
      isLoading: false,
    });
    renderWithTheme(<BucketList />);

    emitFiltersChange();

    expect(await screen.findByText('bucket-a')).toBeVisible();
    expect(await screen.findByText('bucket-b')).toBeVisible();
    expect(await screen.findByText(/Total storage used:/)).toBeVisible();
  });

  it('shows an error state when regions/endpoints fail to load', async () => {
    // BucketList renders the error UI when bucket fetching failed for all regions.
    // It calls useObjectStorageBuckets twice (filtered + all), and will re-render after the filters emit.
    const errorReturn = {
      data: [],
      failedRegionIds: [],
      isLoading: false,
      bucketFetchFailedForAllRegions: true,
    };

    mocks.useObjectStorageBuckets.mockReset();
    mocks.useObjectStorageBuckets
      // initial render: filtered + all
      .mockReturnValueOnce(errorReturn)
      .mockReturnValueOnce(errorReturn)
      // after filters change triggers a re-render: filtered + all again
      .mockReturnValueOnce(errorReturn)
      .mockReturnValueOnce(errorReturn);

    renderWithTheme(<BucketList />);

    // In this state the filters UI isn't rendered (BucketList returns early), so just assert on the error.
    expect(
      await screen.findByText(
        'There was an error retrieving your buckets. Please reload and try again.'
      )
    ).toBeVisible();
  });

  it('opens details drawer when a bucket details action is clicked', async () => {
    const openDrawer = vi.fn();
    mocks.useBucketDrawers.mockReturnValue({ openDrawer });
    renderWithTheme(<BucketList />);

    emitFiltersChange();

    const detailsButtons = await screen.findAllByRole('button', {
      name: /details/i,
    });
    fireEvent.click(detailsButtons[0]);

    await waitFor(() => {
      expect(openDrawer).toHaveBeenCalledWith(
        'bucket-details',
        expect.any(String),
        'bucket-1'
      );
    });
  });

  it('opens deletion dialog when remove is clicked', async () => {
    renderWithTheme(<BucketList />);

    emitFiltersChange();

    const removeButtons = await screen.findAllByRole('button', {
      name: /remove/i,
    });
    fireEvent.click(removeButtons[0]);

    expect(screen.getByTestId('deletion-dialog')).toBeInTheDocument();
  });
});
