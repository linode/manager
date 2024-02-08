import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { placementGroupFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { PlacementGroupsDeleteModal } from './PlacementGroupsDeleteModal';

const queryMocks = vi.hoisted(() => ({
  useDeletePlacementGroup: vi.fn().mockReturnValue({
    mutateAsync: vi.fn().mockResolvedValue({}),
  }),
}));

vi.mock('src/queries/placementGroups', async () => {
  const actual = await vi.importActual('src/queries/placementGroups');
  return {
    ...actual,
    useDeletePlacementGroup: queryMocks.useDeletePlacementGroup,
  };
});

describe('PlacementGroupsDeleteModal', () => {
  it('should render the right form elements', () => {
    const props = {
      onClose: vi.fn(),
      open: true,
      selectedPlacementGroup: placementGroupFactory.build({
        affinity_type: 'anti_affinity',
        label: 'PG-to-delete',
      }),
    };
    const { getByRole } = renderWithTheme(
      <PlacementGroupsDeleteModal {...props} />
    );

    expect(
      getByRole('heading', {
        name: 'Delete Placement Group PG-to-delete (Anti-affinity)',
      })
    ).toBeInTheDocument();
    expect(getByRole('button', { name: 'Close' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Delete' })).toBeInTheDocument();

    const textBox = getByRole('textbox', { name: 'Placement Group' });
    const deleteButton = getByRole('button', { name: 'Delete' });

    fireEvent.change(textBox, { target: { value: 'PG-to-delete' } });

    expect(deleteButton).toBeEnabled();

    fireEvent.click(deleteButton);

    expect(queryMocks.useDeletePlacementGroup).toHaveBeenCalled();
  });
});
