import * as React from 'react';

import { placementGroupFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { PlacementGroupsSummary } from './PlacementGroupsSummary';

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

describe('PlacementGroups Summary', () => {
  it('renders the placement group detail summary panel', () => {
    const { getByText } = renderWithTheme(
      <PlacementGroupsSummary
        placementGroup={placementGroupFactory.build({
          affinity_type: 'affinity',
          capacity: 10,
          compliant: true,
          id: 3,
          label: 'pg-3',
          linode_ids: [2, 4, 6, 8, 10],
          region: 'us-east',
        })}
      />
    );

    expect(getByText('Placement Group Configuration')).toBeInTheDocument();
    expect(getByText('Linodes')).toBeInTheDocument();
    expect(getByText('Affinity Type')).toBeInTheDocument();
    expect(getByText('Region')).toBeInTheDocument();
  });
});
