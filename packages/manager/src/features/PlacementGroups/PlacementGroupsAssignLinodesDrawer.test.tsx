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

vi.mock('src/queries/regions/regions', async () => {
  const actual = await vi.importActual('src/queries/regions/regions');
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

    const { container } = renderWithTheme(
      <PlacementGroupsAssignLinodesDrawer
        onClose={vi.fn()}
        open={true}
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
    queryMocks.useRegionsQuery.mockReturnValue(regionFactory.buildList(5));
    queryMocks.useUnpaginatedPlacementGroupsQuery.mockReturnValue({
      data: placementGroupFactory.build(),
    });
    queryMocks.useAssignLinodesToPlacementGroup.mockReturnValue(
      placementGroupFactory.build({
        linodes: [
          {
            is_compliant: true,
            linode: 1,
          },
          {
            is_compliant: true,
            linode: 2,
          },
          {
            is_compliant: true,
            linode: 3,
          },
          {
            is_compliant: true,
            linode: 5,
          },
          {
            is_compliant: true,
            linode: 6,
          },
          {
            is_compliant: true,
            linode: 7,
          },
          {
            is_compliant: true,
            linode: 8,
          },
          {
            is_compliant: true,
            linode: 9,
          },
          {
            is_compliant: true,
            linode: 43,
          },
          {
            is_compliant: true,
            linode: 11,
          },
        ],
      })
    );

    const { getByPlaceholderText, getByRole, getByText } = renderWithTheme(
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
