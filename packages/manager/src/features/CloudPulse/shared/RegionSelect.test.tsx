import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CloudPulseRegionSelectProps } from './RegionSelect';
import { CloudPulseRegionSelect } from './RegionSelect';

const props: CloudPulseRegionSelectProps = {
  handleRegionChange: vi.fn(),
};

describe('CloudViewRegionSelect', () => {
  it('should render a Region Select component', () => {
    const { getByTestId } = renderWithTheme(
      <CloudPulseRegionSelect {...props} />
    );
    expect(getByTestId('region-select')).toBeInTheDocument();
  });
});
