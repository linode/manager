import * as React from 'react';

import * as regions from 'src/queries/regions/regions';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { CloudPulseRegionSelect } from './CloudPulseRegionSelect';

import type { CloudPulseRegionSelectProps } from './CloudPulseRegionSelect';
import type { Region } from '@linode/api-v4';

const props: CloudPulseRegionSelectProps = {
  handleRegionChange: vi.fn(),
  selectedDashboard: undefined,
};

describe('CloudPulseRegionSelect', () => {
  vi.spyOn(regions, 'useRegionsQuery').mockReturnValue({
    data: Array<Region>(),
  } as ReturnType<typeof regions.useRegionsQuery>);

  it('should render a Region Select component', () => {
    const { getByTestId } = renderWithTheme(
      <CloudPulseRegionSelect {...props} />
    );
    expect(getByTestId('region-select')).toBeInTheDocument();
  });
});
