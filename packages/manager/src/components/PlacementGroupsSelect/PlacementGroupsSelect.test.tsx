import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { placementGroupFactory, regionFactory } from 'src/factories';
import { PLACEMENT_GROUP_HAS_NO_CAPACITY } from 'src/features/PlacementGroups/constants';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { PlacementGroupsSelect } from './PlacementGroupsSelect';

import type { PlacementGroupsSelectProps } from './PlacementGroupsSelect';

const props: PlacementGroupsSelectProps = {
  errorText: '',
  handlePlacementGroupChange: vi.fn(),
  id: '',
  label: 'Placement Groups in Atlanta, GA (us-southeast)',
  noOptionsMessage: '',
  selectedPlacementGroup: null,
  selectedRegion: regionFactory.build({ id: 'us-southeast' }),
};

const queryMocks = vi.hoisted(() => ({
  useAllPlacementGroupsQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/placementGroups', async () => {
  const actual = await vi.importActual('src/queries/placementGroups');
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
          affinity_type: 'affinity:local',
          id: 1,
          is_compliant: true,
          is_strict: true,
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
          affinity_type: 'affinity:local',
          id: 1,
          is_compliant: true,
          is_strict: true,
          label: 'my-placement-group',
          members: [
            {
              is_compliant: true,
              linode_id: 1,
            },
          ],
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
          maximum_vms_per_pg: 1,
        })}
      />
    );

    const select = getByPlaceholderText('Select a Placement Group');
    expect(select).toBeEnabled();

    fireEvent.focus(select);
    fireEvent.change(select, {
      target: { value: 'my-placement-group (Affinity)' },
    });

    const selectedRegionOption = getByText('my-placement-group (Affinity)');
    fireEvent.click(selectedRegionOption);

    expect(
      getByText(`Option disabled: ${PLACEMENT_GROUP_HAS_NO_CAPACITY}`)
    ).toBeVisible();
  });
});
