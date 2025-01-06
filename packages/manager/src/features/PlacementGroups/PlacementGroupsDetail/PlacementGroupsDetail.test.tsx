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
  useParams: vi.fn().mockReturnValue({}),
  usePlacementGroupQuery: vi.fn().mockReturnValue({}),
  useRegionsQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/placementGroups', async () => {
  const actual = await vi.importActual('src/queries/placementGroups');
  return {
    ...actual,
    usePlacementGroupQuery: queryMocks.usePlacementGroupQuery,
  };
});

vi.mock('src/queries/linodes/linodes', async () => {
  const actual = await vi.importActual('src/queries/linodes/linodes');
  return {
    ...actual,
    useAllLinodesQuery: queryMocks.useAllLinodesQuery,
  };
});

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: queryMocks.useParams,
  };
});

vi.mock('src/queries/regions/regions', async () => {
  const actual = await vi.importActual('src/queries/regions/regions');
  return {
    ...actual,
    useRegionsQuery: queryMocks.useRegionsQuery,
  };
});

describe('PlacementGroupsLanding', () => {
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
      <PlacementGroupsDetail />,
      {
        initialRoute: '/placement-groups/1',
      }
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

    const { getByText } = await renderWithThemeAndRouter(
      <PlacementGroupsDetail />,
      {
        initialRoute: '/placement-groups/1',
      }
    );

    expect(getByText(/my first pg/i)).toBeInTheDocument();
    expect(getByText(/docs/i)).toBeInTheDocument();
  });
});
