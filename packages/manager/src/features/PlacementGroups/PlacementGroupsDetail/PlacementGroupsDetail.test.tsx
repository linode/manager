import * as React from 'react';

import {
  linodeFactory,
  placementGroupFactory,
  regionFactory,
} from 'src/factories';
import { renderWithThemeAndRouter } from 'src/utilities/testHelpers';

import { PlacementGroupsDetail } from './PlacementGroupsDetail';

const queryMocks = vi.hoisted(() => ({
  useAllLinodesQuery: vi.fn().mockReturnValue({}),
  useParams: vi.fn().mockReturnValue({ id: 1 }),
  usePlacementGroupQuery: vi.fn().mockReturnValue({}),
  useRegionsQuery: vi.fn().mockReturnValue({}),
  useSearch: vi.fn().mockReturnValue({ query: undefined }),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useAllLinodesQuery: queryMocks.useAllLinodesQuery,
    usePlacementGroupQuery: queryMocks.usePlacementGroupQuery,
    useRegionsQuery: queryMocks.useRegionsQuery,
  };
});

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useParams: queryMocks.useParams,
    useSearch: queryMocks.useSearch,
  };
});

describe('PlacementGroupsDetail', () => {
  it('renders a error page', async () => {
    const { getByText } = await renderWithThemeAndRouter(
      <PlacementGroupsDetail />
    );

    expect(getByText('Not Found')).toBeInTheDocument();
  });

  it('renders a loading state', async () => {
    queryMocks.usePlacementGroupQuery.mockReturnValue({
      data: placementGroupFactory.build({
        id: 1,
      }),
      isLoading: true,
    });
    queryMocks.useAllLinodesQuery.mockReturnValue({
      data: [
        linodeFactory.build({
          id: 1,
        }),
      ],
      isLoading: true,
    });
    queryMocks.useParams.mockReturnValue({ id: '1' });
    queryMocks.useRegionsQuery.mockReturnValue({
      data: [
        regionFactory.build({
          id: 'us-east',
        }),
      ],
    });

    const { getByRole } = await renderWithThemeAndRouter(
      <PlacementGroupsDetail />
    );

    expect(getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders breadcrumbs, docs link and tabs', async () => {
    queryMocks.usePlacementGroupQuery.mockReturnValue({
      data: placementGroupFactory.build({
        id: 1,
        is_compliant: true,
        label: 'My first PG',
        placement_group_type: 'anti_affinity:local',
      }),
    });
    queryMocks.useAllLinodesQuery.mockReturnValue({
      data: [],
      isLoading: false,
      page: 1,
      pages: 1,
      results: 0,
    });

    const { getByText } = await renderWithThemeAndRouter(
      <PlacementGroupsDetail />
    );

    expect(getByText(/my first pg/i)).toBeInTheDocument();
    expect(getByText(/docs/i)).toBeInTheDocument();
  });
});
