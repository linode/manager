import * as React from 'react';

import { placementGroupFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { PLACEMENT_GROUP_LINODES_ERROR_MESSAGE } from '../../constants';
import { PlacementGroupsLinodes } from './PlacementGroupsLinodes';

describe('PlacementGroupsLinodes', () => {
  it('renders an error state if placement groups are undefined', () => {
    const { getByText } = renderWithTheme(
      <PlacementGroupsLinodes placementGroup={undefined} />
    );

    expect(
      getByText(PLACEMENT_GROUP_LINODES_ERROR_MESSAGE)
    ).toBeInTheDocument();
  });

  it('features the linodes table, a filter field, a create button and a docs link', () => {
    const placementGroup = placementGroupFactory.build({
      capacity: 2,
      linode_ids: [1],
    });

    const { getByPlaceholderText, getByRole, getByTestId } = renderWithTheme(
      <PlacementGroupsLinodes placementGroup={placementGroup} />
    );

    expect(getByTestId('add-linode-to-placement-group-button')).toHaveAttribute(
      'aria-disabled',
      'false'
    );
    expect(getByPlaceholderText('Search Linodes')).toBeInTheDocument();
    expect(getByRole('table')).toBeInTheDocument();
  });

  it('has a disabled create button if the placement group has reached capacity', () => {
    const placementGroup = placementGroupFactory.build({
      capacity: 1,
      linode_ids: [1],
    });

    const { getByTestId } = renderWithTheme(
      <PlacementGroupsLinodes placementGroup={placementGroup} />
    );

    expect(getByTestId('add-linode-to-placement-group-button')).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });
});
