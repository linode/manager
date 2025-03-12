import * as queries from '@linode/queries';
import * as React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { CloudPulseRegionSelect } from './RegionSelect';

import type { Region } from '@linode/api-v4';

describe('RegionSelect', () => {
  vi.spyOn(queries, 'useRegionsQuery').mockReturnValue({
    data: Array<Region>(),
  } as ReturnType<typeof queries.useRegionsQuery>);

  it('should render a RegionSelect component', () => {
    const { getByTestId } = renderWithThemeAndHookFormContext({
      component: <CloudPulseRegionSelect name="region" />,
    });
    expect(getByTestId('region-select')).toBeInTheDocument();
  });
  it('should render a Region Select component with proper error message on api call failure', () => {
    vi.spyOn(queries, 'useRegionsQuery').mockReturnValue({
      data: undefined,
      isError: true,
      isLoading: false,
    } as ReturnType<typeof queries.useRegionsQuery>);
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <CloudPulseRegionSelect name="region" />,
    });

    expect(getByText('Failed to fetch Region.'));
  });
});
