import * as React from 'react';

import * as regions from 'src/queries/regions/regions';
import { renderWithThemeAndFormik } from 'src/utilities/testHelpers';

import { initialValues } from '../CreateAlertDefinition';
import { CloudPulseRegionSelect } from './RegionSelect';

import type { Region } from '@linode/api-v4';

describe('RegionSelect', () => {
  vi.spyOn(regions, 'useRegionsQuery').mockReturnValue({
    data: Array<Region>(),
  } as ReturnType<typeof regions.useRegionsQuery>);

  it('should render a RegionSelect component', () => {
    const { getByTestId } = renderWithThemeAndFormik(
      <CloudPulseRegionSelect name={'region'} />,
      { initialValues, onSubmit: vi.fn() }
    );
    expect(getByTestId('region-select')).toBeInTheDocument();
  });
});
