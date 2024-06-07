import * as React from 'react';

import { userEvent } from '@testing-library/user-event';
import { linodeFactory, placementGroupFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { PlacementGroupsDeleteModal } from './PlacementGroupsDeleteModal';

const queryMocks = vi.hoisted(() => ({
  useDeletePlacementGroup: vi.fn().mockReturnValue({
    mutateAsync: vi.fn().mockResolvedValue({}),
    reset: vi.fn(),
  }),
}));

vi.mock('src/queries/placementGroups', async () => {
  const actual = await vi.importActual('src/queries/placementGroups');
  return {
    ...actual,
    useDeletePlacementGroup: queryMocks.useDeletePlacementGroup,
  };
});

const props = {
  isLoading: false,
  onClose: vi.fn(),
  open: true,
};

describe('PlacementGroupsDeleteModal', () => {
  it('should render the right form elements', async () => {
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
          affinity_type: 'anti_affinity:local',
          id: 1,
          label: 'PG-to-delete',
          members: [
            {
              is_compliant: true,
              linode_id: 1,
            },
          ],
          region: 'us-east',
        })}
        disableUnassignButton={false}
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
          affinity_type: 'anti_affinity:local',
          id: 1,
          label: 'PG-to-delete',
          members: [],
        })}
        disableUnassignButton={false}
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
