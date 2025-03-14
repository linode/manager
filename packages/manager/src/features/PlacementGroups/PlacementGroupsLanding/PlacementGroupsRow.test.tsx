import { linodeFactory } from '@linode/utilities';
import * as React from 'react';

import { placementGroupFactory, regionFactory } from 'src/factories';
import {
  renderWithTheme,
  resizeScreenSize,
  wrapWithTableBody,
} from 'src/utilities/testHelpers';

import { PlacementGroupsRow } from './PlacementGroupsRow';

const handleDeletePlacementGroupMock = vi.fn();
const handleEditPlacementGroupMock = vi.fn();

const linode = linodeFactory.build({
  label: 'linode-1',
  region: 'us-east',
});

const placementGroup = placementGroupFactory.build({
  id: 1,
  is_compliant: false,
  label: 'group 1',
  members: [
    {
      is_compliant: true,
      linode_id: 1,
    },
  ],
  placement_group_type: 'anti_affinity:local',
  region: 'us-east',
});

const region = regionFactory.build({
  country: 'us',
  id: 'us-east',
  label: 'Newark, NJ',
  status: 'ok',
});

describe('PlacementGroupsRow', () => {
  it('renders the columns with proper data', () => {
    resizeScreenSize(1200);
    const { getByRole, getByTestId, getByText } = renderWithTheme(
      wrapWithTableBody(
        <PlacementGroupsRow
          assignedLinodes={[linode]}
          disabled
          handleDeletePlacementGroup={handleDeletePlacementGroupMock}
          handleEditPlacementGroup={handleEditPlacementGroupMock}
          placementGroup={placementGroup}
          region={region}
        />
      )
    );

    expect(getByTestId('link-to-placement-group-1')).toHaveTextContent(
      'group 1'
    );
    expect(getByText('Non-compliant')).toBeInTheDocument();
    expect(getByTestId('placement-group-1-assigned-linodes')).toHaveTextContent(
      '1'
    );
    expect(getByText('Newark, NJ')).toBeInTheDocument();
    expect(getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });
});
