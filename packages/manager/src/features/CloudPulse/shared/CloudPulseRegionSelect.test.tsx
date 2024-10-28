import * as React from 'react';

import * as regions from 'src/queries/regions/regions';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { CloudPulseRegionSelect } from './CloudPulseRegionSelect';

import type { CloudPulseRegionSelectProps } from './CloudPulseRegionSelect';
import type { Region } from '@linode/api-v4';

const props: CloudPulseRegionSelectProps = {
  handleRegionChange: vi.fn(),
  label: 'Region',
  selectedDashboard: undefined,
};

describe('CloudPulseRegionSelect', () => {
  vi.spyOn(regions, 'useRegionsQuery').mockReturnValue({
    data: Array<Region>(),
  } as ReturnType<typeof regions.useRegionsQuery>);

  it('should render a Region Select component', () => {
    const { getByLabelText, getByTestId } = renderWithTheme(
      <CloudPulseRegionSelect {...props} />
    );
    const { label } = props;
    expect(getByLabelText(label)).toBeInTheDocument();
    expect(getByTestId('region-select')).toBeInTheDocument();
  });

  it('should render a Region Select component with proper error message on api call failure', () => {
    vi.spyOn(regions, 'useRegionsQuery').mockReturnValue({
      data: undefined,
      isError: true,
      isLoading: false,
    } as ReturnType<typeof regions.useRegionsQuery>);
    const { getByText } = renderWithTheme(
      <CloudPulseRegionSelect {...props} />
    );

    expect(getByText('Failed to fetch Region'));
  });
});
