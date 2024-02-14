import * as React from 'react';

import { placementGroupFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { PlacementGroupsSummary } from './PlacementGroupsSummary';

describe('PlacementGroups Summary', () => {
  it('renders the placement group detail summary panel', () => {
    const { getByTestId, getByText } = renderWithTheme(
      <PlacementGroupsSummary
        placementGroup={placementGroupFactory.build({
          affinity_type: 'affinity',
          id: 3,
          is_compliant: true,
          label: 'pg-3',
          linode_ids: [2, 4, 6, 8, 10],
          region: 'us-east',
        })}
      />
    );

    expect(getByText('Placement Group Configuration')).toBeInTheDocument();
    expect(getByText('Linodes')).toBeInTheDocument();
    expect(getByTestId('HelpOutlineIcon')).toBeInTheDocument();
    expect(getByText('Affinity Type')).toBeInTheDocument();
    expect(getByText('Region')).toBeInTheDocument();
  });
});
