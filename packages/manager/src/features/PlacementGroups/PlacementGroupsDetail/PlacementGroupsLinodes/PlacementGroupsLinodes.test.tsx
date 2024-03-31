import * as React from 'react';

import { placementGroupFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { PLACEMENT_GROUP_LINODES_ERROR_MESSAGE } from '../../constants';
import { PlacementGroupsLinodes } from './PlacementGroupsLinodes';

describe('PlacementGroupsLinodes', () => {
  it('renders an error state if placement groups are undefined', () => {
    const { getByText } = renderWithTheme(
      <PlacementGroupsLinodes
        assignedLinodes={[]}
        isFetchingLinodes={false}
        isLinodeReadOnly={false}
        placementGroup={undefined}
        region={undefined}
      />
    );

    expect(
      getByText(PLACEMENT_GROUP_LINODES_ERROR_MESSAGE)
    ).toBeInTheDocument();
  });

  it('features the linodes table, a filter field, a create button and a docs link', () => {
    const placementGroup = placementGroupFactory.build({
      members: [
        {
          is_compliant: true,
          linode_id: 1,
        },
      ],
    });

    const { getByPlaceholderText, getByRole } = renderWithTheme(
      <PlacementGroupsLinodes
        assignedLinodes={[]}
        isFetchingLinodes={false}
        isLinodeReadOnly={false}
        placementGroup={placementGroup}
        region={undefined}
      />
    );

    expect(getByPlaceholderText('Search Linodes')).toBeInTheDocument();
    expect(getByRole('table')).toBeInTheDocument();
  });
});
