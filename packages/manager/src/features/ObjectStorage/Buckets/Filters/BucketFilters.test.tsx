import { screen, waitFor } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { BucketFilters } from './BucketFilters';

import type { Region } from '@linode/api-v4';

// Hoist router & hook mocks
const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  useSearch: vi.fn(),
  useObjectStorageRegionsWithAssignedEndpoints: vi.fn(),
  useObjectStorageBucketsByRegions: vi.fn(),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-router')>(
    '@tanstack/react-router'
  );
  return {
    ...actual,
    useNavigate: () => mocks.navigate,
    useSearch: () => mocks.useSearch(),
  };
});

vi.mock(
  'src/features/ObjectStorage/shared/hooks/useObjectStorageRegionsWithAssignedEndpoints',
  () => ({
    useObjectStorageRegionsWithAssignedEndpoints:
      mocks.useObjectStorageRegionsWithAssignedEndpoints,
  })
);

vi.mock('../hooks/useObjectStorageBucketsByRegions', () => ({
  useObjectStorageBucketsByRegions: mocks.useObjectStorageBucketsByRegions,
}));

// Mock the heavy child multiselect components so we can focus on search param behavior.
vi.mock(
  'src/features/ObjectStorage/shared/components/RegionSelect/RegionMultiSelect',
  () => ({
    RegionMultiSelect: (props: {
      optionsLoading: boolean;
      selectedRegions?: Region[];
    }) => {
      const selected =
        props.selectedRegions?.map((region) => region.id).sort() ?? [];
      return (
        <div data-testid="region-multiselect">
          selected={selected.join(',')};loading={String(props.optionsLoading)}
        </div>
      );
    },
  })
);

vi.mock(
  'src/features/ObjectStorage/shared/components/EndpointSelect/EndpointMultiSelect',
  () => ({
    EndpointMultiSelect: (props: {
      optionsLoading: boolean;
      values: Array<{ label: string }>;
    }) => (
      <div data-testid="endpoint-multiselect">
        selected={props.values.map((v) => v.label).join(',')};loading=
        {String(props.optionsLoading)}
      </div>
    ),
  })
);

describe('BucketFilters', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.useSearch.mockReturnValue({});
    mocks.useObjectStorageRegionsWithAssignedEndpoints.mockReturnValue({
      regionsWithAssignedEndpoints: [
        { id: 'us-east', label: 'US East' },
        { id: 'eu-west', label: 'EU West' },
      ],
      objectStorageEndpoints: [
        { region: 'us-east', s3_endpoint: 'us-east-1.linodeobjects.com' },
        { region: 'eu-west', s3_endpoint: 'eu-west-1.linodeobjects.com' },
      ],
      isLoading: false,
    });
    mocks.useObjectStorageBucketsByRegions.mockReturnValue({
      isLoading: false,
      bucketQueriesByRegions: {
        'us-east': { data: [] },
        'eu-west': { data: [] },
      },
    });
  });

  it('renders the filter heading', () => {
    renderWithTheme(<BucketFilters />);
    expect(screen.getByText('Filter by')).toBeVisible();
  });

  it('prepopulates filters from the URL search params', () => {
    mocks.useSearch.mockReturnValue({
      regions: 'eu-west,us-east',
      endpoints: 'eu-west-1.linodeobjects.com',
    });
    renderWithTheme(<BucketFilters />);
    expect(screen.getByTestId('region-multiselect')).toHaveTextContent(
      'selected=eu-west,us-east'
    );
    expect(screen.getByTestId('endpoint-multiselect')).toHaveTextContent(
      'selected=eu-west-1.linodeobjects.com'
    );
  });

  it('calls onFiltersChange with the decoded sets', async () => {
    mocks.useSearch.mockReturnValue({
      regions: 'us-east',
      endpoints: 'us-east-1.linodeobjects.com',
    });
    const onFiltersChange = vi.fn();
    renderWithTheme(<BucketFilters onFiltersChange={onFiltersChange} />);
    await waitFor(() => {
      expect(onFiltersChange).toHaveBeenCalledWith({
        regionIdsFilter: new Set(['us-east']),
        endpointsFilter: new Set(['us-east-1.linodeobjects.com']),
      });
    });
  });

  it('normalizes invalid regions/endpoints in search params by navigating with cleaned values', async () => {
    mocks.useSearch.mockReturnValue({
      regions: 'us-east,invalid-region',
      endpoints: 'not-a-real-endpoint',
    });
    renderWithTheme(<BucketFilters />);
    await waitFor(() => {
      expect(mocks.navigate).toHaveBeenCalledWith({
        search: {
          regions: 'us-east',
        },
        replace: true,
      });
    });
  });
});
