import { linodeFactory, regionFactory } from '@linode/utilities';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { dashboardFactory, databaseInstanceFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { DBAAS_CAPABILITY, LINODE_CAPABILITY } from '../Utils/FilterConfig';
import { CloudPulseRegionSelect } from './CloudPulseRegionSelect';

import type { CloudPulseRegionSelectProps } from './CloudPulseRegionSelect';
import type { Region } from '@linode/api-v4';
import type { useRegionsQuery } from '@linode/queries';
import type { CloudPulseResourceTypeMapFlag, Flags } from 'src/featureFlags';

const props: CloudPulseRegionSelectProps = {
  handleRegionChange: vi.fn(),
  label: 'Region',
  selectedDashboard: undefined,
  disabled: false,
  xFilter: {},
};

const queryMocks = vi.hoisted(() => ({
  useRegionsQuery: vi.fn().mockReturnValue({}),
  useResourcesQuery: vi.fn().mockReturnValue({}),
}));

const flags: Partial<Flags> = {
  aclpResourceTypeMap: [
    {
      serviceType: 'dbaas',
      supportedRegionIds: 'us-west, us-east',
    },
    {
      serviceType: 'linode',
      supportedRegionIds: 'us-lax, us-mia',
    },
  ] as CloudPulseResourceTypeMapFlag[],
};

const allRegions: Region[] = [
  regionFactory.build({
    capabilities: [LINODE_CAPABILITY],
    id: 'us-lax',
    label: 'US, Los Angeles, CA',
  }),
  regionFactory.build({
    capabilities: [LINODE_CAPABILITY],
    id: 'us-mia',
    label: 'US, Miami, FL',
  }),
  regionFactory.build({
    capabilities: [DBAAS_CAPABILITY],
    id: 'us-west',
    label: 'US, Fremont, CA',
  }),
  regionFactory.build({
    capabilities: [DBAAS_CAPABILITY],
    id: 'us-east',
    label: 'US, Newark, NJ',
  }),
  regionFactory.build({
    capabilities: [DBAAS_CAPABILITY],
    id: 'us-central',
    label: 'US, Dallas, TX',
  }),
];

vi.mock('@linode/queries', async (importOriginal) => ({
  ...(await importOriginal()),
  useRegionsQuery: queryMocks.useRegionsQuery,
}));

vi.mock('src/queries/cloudpulse/resources', async () => {
  const actual = await vi.importActual('src/queries/cloudpulse/resources');
  return {
    ...actual,
    useResourcesQuery: queryMocks.useResourcesQuery,
  };
});

beforeEach(() => {
  queryMocks.useRegionsQuery.mockReturnValue({
    data: allRegions,
    isError: false,
    isLoading: false,
  });

  queryMocks.useResourcesQuery.mockReturnValue({
    data: linodeFactory.buildList(3, {
      region: 'us-lax',
    }),
    isError: false,
    isLoading: false,
  });
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
    } as ReturnType<typeof useRegionsQuery>);
    const { getByText } = renderWithTheme(
      <CloudPulseRegionSelect {...props} />
    );

    expect(getByText('Failed to fetch Region.'));
  });

  it('should render a Region Select component with proper error message on resources api call failure', () => {
    queryMocks.useResourcesQuery.mockReturnValue({
      data: null,
      isError: true,
      isLoading: false,
    });
    const updatedProps = {
      ...props,
      selectedDashboard: dashboardFactory.build({ service_type: 'dbaas' }),
    };
    renderWithTheme(<CloudPulseRegionSelect {...updatedProps} />);

    const errorMessage = screen.getByText('Failed to fetch Region.');

    expect(errorMessage).not.toBeNull();
  });

  it('should render a Region Select component with proper error message on both region and resources api call failure', () => {
    queryMocks.useResourcesQuery.mockReturnValue({
      data: null,
      isError: true,
      isLoading: false,
    });
    queryMocks.useRegionsQuery.mockReturnValue({
      data: null,
      isError: true,
      isLoading: false,
    });
    renderWithTheme(<CloudPulseRegionSelect {...props} />);

    expect(queryMocks.useResourcesQuery).toHaveBeenLastCalledWith(
      false,
      undefined,
      {},
      {}
    ); // use resources should have called with enabled false since the region call failed

    const errorMessage = screen.getByText('Failed to fetch Region.'); // should show regions failure only

    expect(errorMessage).not.toBeNull();
  });

  it('should render a Region Select component with capability specific and launchDarkly based supported regions', async () => {
    const user = userEvent.setup();

    // resources are present only in us-west, no other regions like us-east here should be listed
    queryMocks.useResourcesQuery.mockReturnValue({
      data: databaseInstanceFactory.buildList(3, {
        region: 'us-west',
      }),
      isError: false,
      isLoading: false,
    });

    renderWithTheme(
      <CloudPulseRegionSelect
        {...props}
        selectedDashboard={dashboardFactory.build({ service_type: 'dbaas' })}
      />,
      { flags }
    );

    await user.click(screen.getByRole('button', { name: 'Open' }));
    // example: region id => 'us-west' belongs to service type - 'dbass', capability -'Managed Databases', and is supported via launchDarkly
    const usWestRegion = screen.getByRole('option', {
      name: 'US, Fremont, CA (us-west)',
    });
    expect(usWestRegion).toBeInTheDocument();

    const usEastRegion = screen.queryByRole('option', {
      name: 'US, Newark, NJ (us-east)',
    });
    expect(usEastRegion).not.toBeInTheDocument();
    expect(
      screen.queryByRole('option', {
        name: 'US, Dallas, TX (us-central)',
      })
    ).toBeNull();
    expect(
      screen.queryByRole('option', {
        name: 'US, Los Angeles, CA (us-lax)',
      })
    ).toBeNull();
    expect(
      screen.queryByRole('option', {
        name: 'US, Miami, FL (us-mia)',
      })
    ).toBeNull();
  });
});
