import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { placementGroupFactory, regionFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { PlacementGroupsEditDrawer } from './PlacementGroupsEditDrawer';

const queryMocks = vi.hoisted(() => ({
  useMutatePlacementGroup: vi.fn().mockReturnValue({
    mutateAsync: vi.fn().mockResolvedValue({}),
    reset: vi.fn(),
  }),
}));

vi.mock('src/queries/placementGroups', async () => {
  const actual = await vi.importActual('src/queries/placementGroups');
  return {
    ...actual,
    useMutatePlacementGroup: queryMocks.useMutatePlacementGroup,
  };
});

describe('PlacementGroupsEditDrawer', () => {
  it('should render, have the proper fields populated with PG values, and have uneditable fields disabled', async () => {
    const { getByLabelText, getByRole, getByText } = renderWithTheme(
      <PlacementGroupsEditDrawer
        selectedPlacementGroup={placementGroupFactory.build({
          id: 1,
          label: 'PG-to-edit',
          placement_group_type: 'anti_affinity:local',
          region: 'us-east',
        })}
        disableEditButton={false}
        isFetching={false}
        onClose={vi.fn()}
        onPlacementGroupEdit={vi.fn()}
        open={true}
        region={regionFactory.build({ id: 'us-east', label: 'Newark, NJ' })}
      />
    );

    expect(
      getByRole('heading', {
        name: 'Edit Placement Group PG-to-edit',
      })
    ).toBeInTheDocument();
    expect(getByText('Newark, NJ (us-east)')).toBeInTheDocument();
    expect(getByLabelText('Label')).toBeEnabled();
    expect(getByLabelText('Label')).toHaveValue('PG-to-edit');
    expect(getByRole('button', { name: 'Cancel' })).toBeEnabled();

    const editButton = getByRole('button', { name: 'Edit' });
    expect(editButton).toBeEnabled();
    await userEvent.click(editButton);

    expect(queryMocks.useMutatePlacementGroup).toHaveBeenCalled();
  });
});
