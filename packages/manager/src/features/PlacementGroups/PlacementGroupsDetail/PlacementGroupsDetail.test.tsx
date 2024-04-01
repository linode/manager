import * as React from 'react';

import { placementGroupFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { PlacementGroupsDetail } from './PlacementGroupsDetail';

const queryMocks = vi.hoisted(() => ({
  usePlacementGroupQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/placementGroups', async () => {
  const actual = await vi.importActual('src/queries/placementGroups');
  return {
    ...actual,
    usePlacementGroupQuery: queryMocks.usePlacementGroupQuery,
  };
});

describe('PlacementGroupsLanding', () => {
  it('renders a error page', () => {
    const { getByText } = renderWithTheme(<PlacementGroupsDetail />);

    expect(getByText('Not Found')).toBeInTheDocument();
  });

  it('renders a loading state', () => {
    queryMocks.usePlacementGroupQuery.mockReturnValue({
      data: {
        data: placementGroupFactory.build({
          id: 1,
        }),
      },
      isLoading: true,
    });

    const { getByRole } = renderWithTheme(<PlacementGroupsDetail />, {
      MemoryRouter: {
        initialEntries: [{ pathname: '/placement-groups/1' }],
      },
    });

    expect(getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders breadcrumbs, docs link and tabs', () => {
    queryMocks.usePlacementGroupQuery.mockReturnValue({
      data: placementGroupFactory.build({
        affinity_type: 'anti_affinity:local',
        id: 1,
        is_compliant: true,
        label: 'My first PG',
      }),
    });

    const { getByRole, getByText } = renderWithTheme(
      <PlacementGroupsDetail />,
      {
        MemoryRouter: {
          initialEntries: [{ pathname: '/placement-groups/1' }],
        },
      }
    );

    expect(getByText(/my first pg \(Anti-affinity\)/i)).toBeInTheDocument();
    expect(getByText(/docs/i)).toBeInTheDocument();
    expect(getByRole('tab', { name: 'Summary' })).toBeInTheDocument();
    expect(getByRole('tab', { name: 'Linodes (9)' })).toBeInTheDocument();
  });
});
