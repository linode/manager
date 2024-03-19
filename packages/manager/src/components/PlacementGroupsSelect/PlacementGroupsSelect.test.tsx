import * as React from 'react';

import { placementGroupFactory, regionFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { PlacementGroupsSelect } from './PlacementGroupsSelect';

import type { PlacementGroupsSelectProps } from './PlacementGroupsSelect';

const props: PlacementGroupsSelectProps = {
  errorText: '',
  handlePlacementGroupChange: vi.fn(),
  id: '',
  label: 'Placement Groups in Atlanta, GA (us-southeast)',
  noOptionsMessage: '',
  selectedRegion: regionFactory.build({ id: 'us-southeast' }),
};

const queryMocks = vi.hoisted(() => ({
  useUnpaginatedPlacementGroupsQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/placementGroups', async () => {
  const actual = await vi.importActual('src/queries/placementGroups');
  return {
    ...actual,
    useUnpaginatedPlacementGroupsQuery:
      queryMocks.useUnpaginatedPlacementGroupsQuery,
  };
});

describe('PlacementGroupSelect', () => {
  beforeEach(() => {
    queryMocks.useUnpaginatedPlacementGroupsQuery.mockReturnValue({
      data: [
        placementGroupFactory.build({
          affinity_type: 'affinity',
          id: 1,
          is_compliant: true,
          is_strict: true,
          label: 'my-placement-group',
          linodes: [
            {
              is_compliant: true,
              linode: 1,
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
});
