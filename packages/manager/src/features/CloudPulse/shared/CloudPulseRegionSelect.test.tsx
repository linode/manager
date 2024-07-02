import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CloudPulseRegionSelectProps } from './CloudPulseRegionSelect';
import { CloudPulseRegionSelect } from './CloudPulseRegionSelect';

import * as regions from 'src/queries/regions/regions';
import { Dashboard, Region } from '@linode/api-v4';

const props: CloudPulseRegionSelectProps = {
  handleRegionChange: vi.fn(),
  selectedDashboard: undefined,
  selectedRegion: undefined,
};

describe('CloudViewRegionSelect', () => {

  vi.spyOn(regions, 'useRegionsQuery').mockReturnValue({ data: Array<Region>()} as ReturnType<typeof regions.useRegionsQuery>);

  it('should render a Region Select component', () => {
    const { getByTestId } = renderWithTheme(
      <CloudPulseRegionSelect {...props} />
    );
    expect(getByTestId('region-select')).toBeInTheDocument();
  });
});
