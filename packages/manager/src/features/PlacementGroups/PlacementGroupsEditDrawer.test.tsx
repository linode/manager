import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { placementGroupFactory, regionFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { PlacementGroupsEditDrawer } from './PlacementGroupsEditDrawer';

const queryMocks = vi.hoisted(() => ({
  useMutatePlacementGroup: vi.fn().mockReturnValue({
    mutateAsync: vi.fn().mockResolvedValue({}),
    reset: vi.fn(),
  }),
  useParams: vi.fn().mockReturnValue({}),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: queryMocks.useParams,
  };
});

vi.mock('src/queries/placementGroups', async () => {
  const actual = await vi.importActual('src/queries/placementGroups');
  return {
    ...actual,
    useMutatePlacementGroup: queryMocks.useMutatePlacementGroup,
  };
});

describe('PlacementGroupsCreateDrawer', () => {
  it('should render, have the proper fields populated with PG values, and have uneditable fields disabled', async () => {
    queryMocks.useParams.mockReturnValue({ id: '1' });

    const { getByLabelText, getByRole, getByText } = renderWithTheme(
      <PlacementGroupsEditDrawer
        selectedPlacementGroup={placementGroupFactory.build({
          affinity_type: 'anti_affinity:local',
          id: 1,
          label: 'PG-to-edit',
          region: 'us-east',
        })}
        disableEditButton={false}
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
    fireEvent.click(editButton);

    expect(queryMocks.useMutatePlacementGroup).toHaveBeenCalled();
  });
});
