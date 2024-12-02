import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { dashboardFactory, regionFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { CloudPulseRegionSelect } from './CloudPulseRegionSelect';

import type { CloudPulseRegionSelectProps } from './CloudPulseRegionSelect';
import type { Region } from '@linode/api-v4';
import type { CloudPulseServiceTypeMapFlag, Flags } from 'src/featureFlags';
import type * as regions from 'src/queries/regions/regions';

const props: CloudPulseRegionSelectProps = {
  handleRegionChange: vi.fn(),
  label: 'Region',
  selectedDashboard: undefined,
};

const queryMocks = vi.hoisted(() => ({
  useRegionsQuery: vi.fn().mockReturnValue({}),
}));

const flags: Partial<Flags> = {
  aclpServiceTypeMap: [
    {
      serviceType: 'dbaas',
      supportedRegionIds: 'us-west',
    },
    {
      serviceType: 'linode',
      supportedRegionIds: 'us-east',
    },
  ] as CloudPulseServiceTypeMapFlag[],
};

vi.mock('src/queries/regions/regions', async () => {
  const actual = await vi.importActual('src/queries/regions/regions');
  return {
    ...actual,
    useRegionsQuery: queryMocks.useRegionsQuery,
  };
});

describe('CloudPulseRegionSelect', () => {
  it('should render a Region Select component', () => {
    const { getByLabelText, getByTestId } = renderWithTheme(
      <CloudPulseRegionSelect {...props} />
    );
    const { label } = props;
    expect(getByLabelText(label)).toBeInTheDocument();
    expect(getByTestId('region-select')).toBeInTheDocument();
  });

  it('should render a Region Select component with proper error message on api call failure', () => {
    queryMocks.useRegionsQuery.mockReturnValue({
      data: undefined,
      isError: true,
      isLoading: false,
    } as ReturnType<typeof regions.useRegionsQuery>);
    const { getByText } = renderWithTheme(
      <CloudPulseRegionSelect {...props} />
    );

    expect(getByText('Failed to fetch Region.'));
  });

  it('should render a Region Select component with capability specific and launchDarkly based supported regions', async () => {
    const user = userEvent.setup();

    const allRegions: Region[] = [
      regionFactory.build({ capabilities: ['Linodes'], id: 'us-east' }),
      regionFactory.build({
        capabilities: ['Managed Databases'],
        id: 'us-west',
        label: 'US, Fremont, CA',
      }),
    ];

    queryMocks.useRegionsQuery.mockReturnValue({
      data: allRegions,
      isError: false,
      isLoading: false,
    });

    const { getByRole } = renderWithTheme(
      <CloudPulseRegionSelect
        {...props}
        // eslint-disable-next-line camelcase
        selectedDashboard={dashboardFactory.build({ service_type: 'dbaas' })}
      />,
      { flags }
    );

    await user.click(getByRole('button', { name: 'Open' }));
    // example: region id => 'us-west' belongs to service type - 'dbass', capability -'Managed Databases', and is supported via launchDarkly
    expect(
      getByRole('option', {
        name: 'US, Fremont, CA (us-west)',
      })
    ).toBeInTheDocument();
});
});