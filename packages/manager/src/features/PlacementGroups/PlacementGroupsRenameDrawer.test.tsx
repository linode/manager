import { waitFor } from '@testing-library/react';
import * as React from 'react';

import { regionFactory } from 'src/factories';
import { placementGroupFactory } from 'src/factories/placementGroups';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { PlacementGroupsRenameDrawer } from './PlacementGroupsRenameDrawer';

describe('PlacementGroupsCreateDrawer', () => {
  it('should render, have the proper fields populated with PG values, and have uneditable fields disabled', async () => {
    server.use(
      rest.get('*/regions', (req, res, ctx) => {
        const regions = regionFactory.buildList(1, {
          capabilities: ['Linodes'],
          id: 'us-east',
          label: 'Fake Region, NC',
        });
        return res(ctx.json(makeResourcePage(regions)));
      })
    );

    const { getByLabelText } = renderWithTheme(
      <PlacementGroupsRenameDrawer
        selectedPlacementGroup={placementGroupFactory.build({
          affinity_type: 'anti_affinity',
          label: 'PG-1',
          region: 'us-east',
        })}
        disableEditButton={false}
        numberOfPlacementGroupsCreated={0}
        onClose={vi.fn()}
        onPlacementGroupRenamed={vi.fn()}
        open={true}
      />
    );

    expect(getByLabelText('Label')).toBeEnabled();
    expect(getByLabelText('Label')).toHaveValue('PG-1');

    expect(getByLabelText('Region')).toBeDisabled();

    await waitFor(() => {
      expect(getByLabelText('Region')).toHaveValue('Fake Region, NC (us-east)');
    });

    expect(getByLabelText('Affinity Type')).toBeDisabled();
    expect(getByLabelText('Affinity Type')).toHaveValue('Anti-affinity');
  });
});
