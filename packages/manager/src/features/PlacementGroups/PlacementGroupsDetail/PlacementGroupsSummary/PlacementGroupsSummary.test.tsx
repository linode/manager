import { regionFactory } from '@linode/utilities';
import * as React from 'react';

import { placementGroupFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { PlacementGroupsSummary } from './PlacementGroupsSummary';

describe('PlacementGroups Summary', () => {
  it('renders the placement group detail summary panel', () => {
    const { getByTestId, getByText } = renderWithTheme(
      <PlacementGroupsSummary
        placementGroup={placementGroupFactory.build({
          id: 3,
          is_compliant: true,
          label: 'pg-3',
          members: [
            {
              is_compliant: true,
              linode_id: 2,
            },
            {
              is_compliant: true,
              linode_id: 4,
            },
            {
              is_compliant: true,
              linode_id: 6,
            },
            {
              is_compliant: true,
              linode_id: 8,
            },
            {
              is_compliant: true,
              linode_id: 10,
            },
          ],
          placement_group_type: 'affinity:local',
          region: 'us-east',
        })}
        region={regionFactory.build({
          id: 'us-east',
        })}
      />
    );

    expect(getByText('Placement Group Configuration')).toBeInTheDocument();
    expect(getByText('Linodes')).toBeInTheDocument();
    expect(getByTestId('HelpOutlineIcon')).toBeInTheDocument();
    expect(getByText('Placement Group Type')).toBeInTheDocument();
    expect(getByText('Region')).toBeInTheDocument();
  });
});
