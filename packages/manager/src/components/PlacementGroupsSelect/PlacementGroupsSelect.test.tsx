import { regionFactory } from '@linode/utilities';
import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { placementGroupFactory } from 'src/factories';
import { PLACEMENT_GROUP_HAS_NO_CAPACITY } from 'src/features/PlacementGroups/constants';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { PlacementGroupsSelect } from './PlacementGroupsSelect';

import type { PlacementGroupsSelectProps } from './PlacementGroupsSelect';

const props: PlacementGroupsSelectProps = {
  handlePlacementGroupChange: vi.fn(),
  label: 'Placement Groups in Atlanta, GA (us-southeast)',
  noOptionsMessage: '',
  selectedPlacementGroupId: null,
  selectedRegion: regionFactory.build({ id: 'us-southeast' }),
};

const queryMocks = vi.hoisted(() => ({
  useAllPlacementGroupsQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useAllPlacementGroupsQuery: queryMocks.useAllPlacementGroupsQuery,
  };
});

describe('PlacementGroupSelect', () => {
  beforeEach(() => {
    queryMocks.useAllPlacementGroupsQuery.mockReturnValue({
      data: [
        placementGroupFactory.build({
          placement_group_type: 'affinity:local',
          id: 1,
          is_compliant: true,
          placement_group_policy: 'strict',
          label: 'my-placement-group',
          members: [
            {
              is_compliant: true,
              linode_id: 1,
            },
          ],
          region: 'us-west',
        }),
      ],
    });
  });

  it('should render a Select component', () => {
    const { getByTestId } = renderWithTheme(
      <PlacementGroupsSelect {...props} />
    );
    expect(getByTestId('placement-groups-select')).toBeInTheDocument();
  });

  it('should render a Select component with the correct label', () => {
    const { getByText } = renderWithTheme(<PlacementGroupsSelect {...props} />);
    expect(getByText(/Placement Groups in /)).toBeInTheDocument();
  });

  it('should have a disabled option if the region has reached its placement group capacity', async () => {
    queryMocks.useAllPlacementGroupsQuery.mockReturnValue({
      data: [
        placementGroupFactory.build({
          id: 1,
          is_compliant: true,
          label: 'my-placement-group',
          members: [
            {
              is_compliant: true,
              linode_id: 1,
            },
          ],
          placement_group_policy: 'strict',
          placement_group_type: 'affinity:local',
          region: 'ca-central',
        }),
      ],
    });
    const { getByPlaceholderText, getByText } = renderWithTheme(
      <PlacementGroupsSelect
        {...props}
        selectedRegion={regionFactory.build({
          capabilities: ['Placement Group'],
          id: 'ca-central',
          placement_group_limits: {
            maximum_linodes_per_pg: 1,
          },
        })}
      />
    );

    const select = getByPlaceholderText('None');
    expect(select).toBeEnabled();

    fireEvent.focus(select);
    fireEvent.change(select, {
      target: { value: 'my-placement-group' },
    });

    const selectedRegionOption = getByText('my-placement-group');
    fireEvent.click(selectedRegionOption);

    expect(getByText(PLACEMENT_GROUP_HAS_NO_CAPACITY)).toBeVisible();
  });
});
