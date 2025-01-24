import * as React from 'react';

import { placementGroupFactory } from 'src/factories';
import { renderWithThemeAndRouter } from 'src/utilities/testHelpers';

import { PLACEMENT_GROUP_LINODES_ERROR_MESSAGE } from '../../constants';
import { PlacementGroupsLinodes } from './PlacementGroupsLinodes';

const queryMocks = vi.hoisted(() => ({
  useSearch: vi.fn().mockReturnValue({ query: undefined }),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useSearch: queryMocks.useSearch,
  };
});

describe('PlacementGroupsLinodes', () => {
  it('renders an error state if placement groups are undefined', async () => {
    const { getByText } = await renderWithThemeAndRouter(
      <PlacementGroupsLinodes
        isLinodeReadOnly={false}
        placementGroup={undefined}
        region={undefined}
      />
    );

    expect(
      getByText(PLACEMENT_GROUP_LINODES_ERROR_MESSAGE)
    ).toBeInTheDocument();
  });

  it('features the linodes table, a filter field, a create button and a docs link', async () => {
    const placementGroup = placementGroupFactory.build({
      members: [
        {
          is_compliant: true,
          linode_id: 1,
        },
      ],
    });

    const { getByPlaceholderText, getByRole } = await renderWithThemeAndRouter(
      <PlacementGroupsLinodes
        isLinodeReadOnly={false}
        placementGroup={placementGroup}
        region={undefined}
      />
    );

    expect(getByPlaceholderText('Search Linodes')).toBeInTheDocument();
    expect(getByRole('table')).toBeInTheDocument();
  });
});
