import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import {
  PlacementGroupsSelect,
  PlacementGroupsSelectProps,
} from './PlacementGroupsSelect';

const props: PlacementGroupsSelectProps = {
  errorText: '',
  id: '',
  label: 'Placement Groups in Atlanta, GA(us-southeast)',
  noOptionsMessage: '',
  selectedRegionID: 'us-southeast',
};

describe('PlacementGroupSelect', () => {
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
