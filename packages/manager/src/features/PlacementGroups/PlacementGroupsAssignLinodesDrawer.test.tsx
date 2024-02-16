import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import {
  linodeFactory,
  placementGroupFactory,
  regionFactory,
} from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { PlacementGroupsAssignLinodesDrawer } from './PlacementGroupsAssignLinodesDrawer';

const queryMocks = vi.hoisted(() => ({
  useAllLinodesQuery: vi.fn().mockReturnValue({}),
  useAssignLinodesToPlacementGroup: vi.fn().mockReturnValue({}),
  useRegionsQuery: vi.fn().mockReturnValue({}),
  useUnpaginatedPlacementGroupsQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/linodes/linodes', async () => {
  const actual = await vi.importActual('src/queries/linodes/linodes');
  return {
    ...actual,
    useAllLinodesQuery: queryMocks.useAllLinodesQuery,
  };
});

vi.mock('src/queries/placementGroups', async () => {
  const actual = await vi.importActual('src/queries/placementGroups');
  return {
    ...actual,
    useUnpaginatedPlacementGroupsQuery:
      queryMocks.useUnpaginatedPlacementGroupsQuery,
  };
});

vi.mock('src/queries/regions', async () => {
  const actual = await vi.importActual('src/queries/regions');
  return {
    ...actual,
    useRegionsQuery: queryMocks.useRegionsQuery,
  };
});

vi.mock('src/queries/placementGroups', async () => {
  const actual = await vi.importActual('src/queries/placementGroups');
  return {
    ...actual,
    useAssignLinodesToPlacementGroup:
      queryMocks.useAssignLinodesToPlacementGroup,
  };
});

describe('PlacementGroupsAssignLinodesDrawer', () => {
  it('should render the error state', () => {
    queryMocks.useAllLinodesQuery.mockReturnValue({
      error: [{ reason: 'Not found' }],
    });

    const { getByText } = renderWithTheme(
      <PlacementGroupsAssignLinodesDrawer
        numberOfPlacementGroupsCreated={9}
        onClose={vi.fn()}
        open={true}
        selectedPlacementGroup={placementGroupFactory.build()}
      />
    );

    expect(
      getByText(
        'There was a problem retrieving your placement group. Please try again'
      )
    ).toBeInTheDocument();
  });

  it('should render the drawer components', () => {
    queryMocks.useAllLinodesQuery.mockReturnValue({
      data: [
        linodeFactory.build({ id: 1, label: 'Linode-1', region: 'us-east' }),
        linodeFactory.build({ id: 2, label: 'Linode-2', region: 'us-east' }),
        linodeFactory.build({ id: 11, label: 'Linode-11', region: 'us-east' }),
      ],
    });
    queryMocks.useRegionsQuery.mockReturnValue(regionFactory.buildList(5));
    queryMocks.useUnpaginatedPlacementGroupsQuery.mockReturnValue({
      data: placementGroupFactory.build(),
    });
    queryMocks.useAssignLinodesToPlacementGroup.mockReturnValue(
      placementGroupFactory.build({
        linode_ids: [1, 2, 0, 1, 2, 3, 5, 6, 7, 8, 43, 11],
      })
    );

    const {
      getByPlaceholderText,
      getByRole,
      getByTestId,
      getByText,
    } = renderWithTheme(
      <PlacementGroupsAssignLinodesDrawer
        selectedPlacementGroup={placementGroupFactory.build({
          affinity_type: 'anti_affinity',
          label: 'PG-1',
          region: 'us-east',
        })}
        onClose={vi.fn()}
        open={true}
      />
    );

    const linodesSelect = getByPlaceholderText('Select a Linode');
    const addLinodeButton = getByRole('button', { name: 'Add Linode' });
    const removableLinodesList = getByTestId('pg-linode-removable-list');

    expect(linodesSelect).toBeInTheDocument();
    expect(addLinodeButton).toHaveAttribute('aria-disabled', 'true');
    expect(removableLinodesList).toHaveTextContent(
      'No Linodes have been assigned.'
    );

    fireEvent.focus(linodesSelect);
    fireEvent.change(linodesSelect, { target: { value: 'Linode-11' } });
    const optionElement = getByText('Linode-11');
    fireEvent.click(optionElement);

    expect(addLinodeButton).not.toHaveAttribute('aria-disabled', 'true');

    fireEvent.click(getByRole('button', { name: 'Add Linode' }));

    expect(addLinodeButton).toHaveAttribute('aria-disabled', 'true');
    expect(removableLinodesList).toHaveTextContent('Linode-11');

    const removeButton = getByRole('button', { name: 'remove Linode-11' });
    fireEvent.click(removeButton);

    expect(removableLinodesList).toHaveTextContent(
      'No Linodes have been assigned.'
    );
  });
});
