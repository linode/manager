import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import {
  PlacementGroupsSelect,
  PlacementGroupsSelectProps,
} from './PlacementGroupsSelect';

describe('PlacementGroupSelect', () => {
  const props: PlacementGroupsSelectProps = {
    errorText: '',
    id: '',
    label: '',
    noOptionsMessage: '',
    selectedRegionID: 'us-southeast',
  };

  it('should render a Select component', () => {
    const { getByTestId } = renderWithTheme(
      <PlacementGroupsSelect {...props} />
    );
    expect(getByTestId('placement-groups-select')).toBeInTheDocument();
  });

  it('should render a Select component with the correct label', () => {
    const { getByText } = renderWithTheme(
      <PlacementGroupsSelect {...props} label="Placement Group" />
    );
    expect(getByText('Region')).toBeInTheDocument();
  });

  it('should render a Select component with the correct error text', () => {
    const { getByText } = renderWithTheme(
      <PlacementGroupsSelect
        {...props}
        errorText="There are no Placement Groups in this region."
      />
    );
    expect(
      getByText('There are no Placement Groups in this region.')
    ).toBeInTheDocument();
  });

  it('should render a Select component with the Notice component', () => {
    const { getByText } = renderWithTheme(
      <PlacementGroupsSelect {...props} selectedRegionID={undefined} />
    );
    expect(
      getByText('Select a region above to see available Placement Groups.')
    ).toBeInTheDocument();
  });
});
