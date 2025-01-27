import * as React from 'react';

import { placementGroupFactory } from 'src/factories';
import { renderWithThemeAndRouter } from 'src/utilities/testHelpers';

import { PlacementGroupsLanding } from './PlacementGroupsLanding';
import { headers } from './PlacementGroupsLandingEmptyStateData';

const queryMocks = vi.hoisted(() => ({
  useParams: vi.fn().mockReturnValue({}),
  usePlacementGroupsQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useParams: queryMocks.useParams,
  };
});

vi.mock('src/queries/placementGroups', async () => {
  const actual = await vi.importActual('src/queries/placementGroups');
  return {
    ...actual,
    usePlacementGroupsQuery: queryMocks.usePlacementGroupsQuery,
  };
});

describe('PlacementGroupsLanding', () => {
  it('renders loading state', async () => {
    queryMocks.usePlacementGroupsQuery.mockReturnValue({
      isLoading: true,
    });

    const { getByRole } = await renderWithThemeAndRouter(
      <PlacementGroupsLanding />,
      {
        initialRoute: '/placement-groups',
      }
    );

    expect(getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders error state', async () => {
    queryMocks.usePlacementGroupsQuery.mockReturnValue({
      error: [{ reason: 'Not found' }],
    });

    const { getByText } = await renderWithThemeAndRouter(
      <PlacementGroupsLanding />,
      {
        initialRoute: '/placement-groups',
      }
    );

    expect(getByText(/not found/i)).toBeInTheDocument();
  });

  it('renders docs link and create button', async () => {
    queryMocks.usePlacementGroupsQuery.mockReturnValue({
      data: {
        data: [
          placementGroupFactory.build({
            label: 'group 1',
          }),
        ],
        results: 1,
      },
    });

    const { getByText } = await renderWithThemeAndRouter(
      <PlacementGroupsLanding />,
      {
        initialRoute: '/placement-groups',
      }
    );

    expect(getByText(/create placement group/i)).toBeInTheDocument();
    expect(getByText(/docs/i)).toBeInTheDocument();
  });

  it('renders placement groups', async () => {
    queryMocks.usePlacementGroupsQuery.mockReturnValue({
      data: {
        data: [
          placementGroupFactory.build({
            label: 'group 1',
          }),
          placementGroupFactory.build({
            label: 'group 2',
          }),
        ],
        results: 2,
      },
    });

    const { getByText } = await renderWithThemeAndRouter(
      <PlacementGroupsLanding />,
      {
        initialRoute: '/placement-groups',
      }
    );

    expect(getByText(/group 1/i)).toBeInTheDocument();
    expect(getByText(/group 2/i)).toBeInTheDocument();
  });

  it('should render placement group landing with empty state', async () => {
    queryMocks.usePlacementGroupsQuery.mockReturnValue({
      data: {
        data: [],
        results: 0,
      },
    });

    const { getByText } = await renderWithThemeAndRouter(
      <PlacementGroupsLanding />,
      {
        initialRoute: '/placement-groups',
      }
    );

    expect(getByText(headers.description)).toBeInTheDocument();
  });

  it('should render placement group Getting Started Guides on landing page with empty state', async () => {
    queryMocks.usePlacementGroupsQuery.mockReturnValue({
      data: {
        data: [],
        results: 0,
      },
    });

    const { getByText } = await renderWithThemeAndRouter(
      <PlacementGroupsLanding />,
      {
        initialRoute: '/placement-groups',
      }
    );

    expect(getByText('Getting Started Guides')).toBeInTheDocument();
  });
});
