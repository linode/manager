import { userEvent } from '@testing-library/user-event';
import * as React from 'react';

import { linodeFactory, placementGroupFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { PlacementGroupsDeleteModal } from './PlacementGroupsDeleteModal';

import type { ManagerPreferences } from 'src/types/ManagerPreferences';

const preference: ManagerPreferences['type_to_confirm'] = true;

const queryMocks = vi.hoisted(() => ({
  useDeletePlacementGroup: vi.fn().mockReturnValue({
    mutateAsync: vi.fn().mockResolvedValue({}),
    reset: vi.fn(),
  }),
  usePreferences: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/profile/preferences', async () => {
  const actual = await vi.importActual('src/queries/profile/preferences');
  return {
    ...actual,
    usePreferences: queryMocks.usePreferences,
  };
});

vi.mock('src/queries/placementGroups', async () => {
  const actual = await vi.importActual('src/queries/placementGroups');
  return {
    ...actual,
    useDeletePlacementGroup: queryMocks.useDeletePlacementGroup,
  };
});

queryMocks.usePreferences.mockReturnValue({
  data: preference,
});

const props = {
  isLoading: false,
  onClose: vi.fn(),
  open: true,
};

describe('PlacementGroupsDeleteModal', () => {
  it('should render the right form elements', () => {
    queryMocks.usePreferences.mockReturnValue({
      data: preference,
    });

    const { getByRole, getByTestId, getByText } = renderWithTheme(
      <PlacementGroupsDeleteModal
        {...props}
        linodes={[
          linodeFactory.build({
            id: 1,
            label: 'test-linode',
            region: 'us-east',
          }),
        ]}
        selectedPlacementGroup={placementGroupFactory.build({
          id: 1,
          label: 'PG-to-delete',
          members: [
            {
              is_compliant: true,
              linode_id: 1,
            },
          ],
          placement_group_type: 'anti_affinity:local',
          region: 'us-east',
        })}
        disableUnassignButton={false}
        isFetching={false}
      />
    );

    expect(
      getByRole('heading', {
        name: 'Delete Placement Group PG-to-delete',
      })
    ).toBeInTheDocument();
    expect(
      getByText('Linodes assigned to Placement Group PG-to-delete')
    ).toBeInTheDocument();
    expect(getByTestId('assigned-linodes')).toContainElement(
      getByText('test-linode')
    );
    expect(getByTestId('textfield-input')).toBeDisabled();
    expect(getByRole('button', { name: 'Close' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Delete' })).toBeDisabled();
  });

  it("should be enabled when there's no assigned linodes", async () => {
    queryMocks.usePreferences.mockReturnValue({
      data: preference,
    });

    const { getByRole, getByTestId } = renderWithTheme(
      <PlacementGroupsDeleteModal
        {...props}
        linodes={[
          linodeFactory.build({
            id: 1,
            label: 'test-linode',
            region: 'us-east',
          }),
        ]}
        selectedPlacementGroup={placementGroupFactory.build({
          id: 1,
          label: 'PG-to-delete',
          members: [],
          placement_group_type: 'anti_affinity:local',
        })}
        disableUnassignButton={false}
        isFetching={false}
      />
    );

    const textField = getByTestId('textfield-input');
    const deleteButton = getByRole('button', { name: 'Delete' });

    expect(textField).toBeEnabled();
    expect(deleteButton).toBeDisabled();

    await userEvent.type(textField, 'PG-to-delete');

    expect(deleteButton).toBeEnabled();
    await userEvent.click(deleteButton);

    expect(queryMocks.useDeletePlacementGroup).toHaveBeenCalled();
  });
});
