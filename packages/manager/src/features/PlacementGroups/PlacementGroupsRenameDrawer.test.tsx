import * as React from 'react';

import { placementGroupFactory } from 'src/factories/placementGroups';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { PlacementGroupsRenameDrawer } from './PlacementGroupsRenameDrawer';

describe('PlacementGroupsCreateDrawer', () => {
  it('should render, have the proper fields populated with PG values, and have uneditable fields disabled', () => {
    const { getByLabelText } = renderWithTheme(
      <PlacementGroupsRenameDrawer
        selectedPlacementGroup={placementGroupFactory.build({
          affinity_type: 'anti_affinity',
          label: 'PG-1',
          region: 'us-east',
        })}
        numberOfPlacementGroupsCreated={0}
        onClose={vi.fn()}
        onPlacementGroupRenamed={vi.fn()}
        open={true}
      />
    );

    expect(getByLabelText('Label')).toBeEnabled();
    expect(getByLabelText('Label')).toHaveValue('PG-1');

    expect(getByLabelText('Region')).toBeDisabled();
    expect(getByLabelText('Region')).toHaveValue('Newark, NJ (us-east)');

    expect(getByLabelText('Affinity Type')).toBeDisabled();
    expect(getByLabelText('Affinity Type')).toHaveValue('Anti-affinity');
  });
});
