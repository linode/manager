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
  useAllPlacementGroupsQuery: vi.fn().mockReturnValue({}),
  useAssignLinodesToPlacementGroup: vi.fn().mockReturnValue({}),
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
    useAllPlacementGroupsQuery: queryMocks.useAllPlacementGroupsQuery,
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

    const { container } = renderWithTheme(
      <PlacementGroupsAssignLinodesDrawer
        onClose={vi.fn()}
        open={true}
        region={regionFactory.build()}
        selectedPlacementGroup={placementGroupFactory.build()}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('should render the drawer components', () => {
    queryMocks.useAllLinodesQuery.mockReturnValue({
      data: [
        linodeFactory.build({ id: 1, label: 'Linode-1', region: 'us-east' }),
        linodeFactory.build({ id: 2, label: 'Linode-2', region: 'us-east' }),
        linodeFactory.build({ id: 11, label: 'Linode-11', region: 'us-east' }),
      ],
    });
    queryMocks.useAllPlacementGroupsQuery.mockReturnValue({
      data: placementGroupFactory.build(),
    });
    queryMocks.useAssignLinodesToPlacementGroup.mockReturnValue(
      placementGroupFactory.build({
        members: [
          {
            is_compliant: true,
            linode_id: 1,
          },
          {
            is_compliant: true,
            linode_id: 2,
          },
          {
            is_compliant: true,
            linode_id: 3,
          },
          {
            is_compliant: true,
            linode_id: 5,
          },
          {
            is_compliant: true,
            linode_id: 6,
          },
          {
            is_compliant: true,
            linode_id: 7,
          },
          {
            is_compliant: true,
            linode_id: 8,
          },
          {
            is_compliant: true,
            linode_id: 9,
          },
          {
            is_compliant: true,
            linode_id: 43,
          },
          {
            is_compliant: true,
            linode_id: 11,
          },
        ],
      })
    );

    const { getByPlaceholderText, getByRole, getByText } = renderWithTheme(
      <PlacementGroupsAssignLinodesDrawer
        selectedPlacementGroup={placementGroupFactory.build({
          placement_group_type: 'anti_affinity:local',
          label: 'PG-1',
          region: 'us-east',
        })}
        onClose={vi.fn()}
        open={true}
        region={regionFactory.build()}
      />
    );

    const linodesSelect = getByPlaceholderText(
      'Select Linode or type to search'
    );
    const assignLinodeButton = getByRole('button', { name: 'Assign Linode' });

    expect(linodesSelect).toBeInTheDocument();
    expect(assignLinodeButton).toHaveAttribute('aria-disabled', 'true');

    fireEvent.focus(linodesSelect);
    fireEvent.change(linodesSelect, { target: { value: 'Linode-11' } });
    const optionElement = getByText('Linode-11');
    fireEvent.click(optionElement);

    expect(assignLinodeButton).not.toHaveAttribute('aria-disabled', 'true');

    fireEvent.click(getByRole('button', { name: 'Assign Linode' }));

    expect(assignLinodeButton).toHaveAttribute('aria-disabled', 'true');
  });
});
