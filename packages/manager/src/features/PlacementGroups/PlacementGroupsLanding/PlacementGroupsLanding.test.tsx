import * as React from 'react';

import { placementGroupFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { PlacementGroupsLanding } from './PlacementGroupsLanding';

const queryMocks = vi.hoisted(() => ({
  usePlacementGroupsQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/placementGroups', async () => {
  const actual = await vi.importActual('src/queries/placementGroups');
  return {
    ...actual,
    usePlacementGroupsQuery: queryMocks.usePlacementGroupsQuery,
  };
});

describe('PlacementGroupsLanding', () => {
  it('renders loading state', () => {
    queryMocks.usePlacementGroupsQuery.mockReturnValue({
      isLoading: true,
    });

    const { getByRole } = renderWithTheme(<PlacementGroupsLanding />);

    expect(getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders error state', () => {
    queryMocks.usePlacementGroupsQuery.mockReturnValue({
      error: [{ reason: 'Not found' }],
    });

    const { getByText } = renderWithTheme(<PlacementGroupsLanding />);

    expect(getByText(/not found/i)).toBeInTheDocument();
  });

  it('renders docs link and create button', () => {
    queryMocks.usePlacementGroupsQuery.mockReturnValue({
      data: {
        data: [],
        results: 0,
      },
    });

    const { getByText } = renderWithTheme(<PlacementGroupsLanding />);

    expect(getByText(/create placement group/i)).toBeInTheDocument();
    expect(getByText(/docs/i)).toBeInTheDocument();
  });

  it('renders placement groups', () => {
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

    const { getByText } = renderWithTheme(<PlacementGroupsLanding />);

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

    const { getByText } = renderWithTheme(<PlacementGroupsLanding />);

    expect(
      getByText(
        'Control the physical placement or distribution of virtual machines (VMs) instances within a data center or availability zone.'
      )
    ).toBeInTheDocument();
  });
});
