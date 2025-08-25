import { capabilityServiceTypeMapping } from '@linode/api-v4';
import { linodeFactory, regionFactory } from '@linode/utilities';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { dashboardFactory, databaseInstanceFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { CloudPulseRegionSelect } from './CloudPulseRegionSelect';

import type { CloudPulseRegionSelectProps } from './CloudPulseRegionSelect';
import type { Region } from '@linode/api-v4';
import type { useRegionsQuery } from '@linode/queries';

const props: CloudPulseRegionSelectProps = {
  filterKey: 'region',
  selectedEntities: [],
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

const allRegions: Region[] = [
  regionFactory.build({
    capabilities: [capabilityServiceTypeMapping['linode']],
    id: 'us-lax',
    label: 'US, Los Angeles, CA',
    monitors: {
      metrics: ['Linodes'],
      alerts: [],
    },
  }),
  regionFactory.build({
    capabilities: [capabilityServiceTypeMapping['linode']],
    id: 'us-mia',
    label: 'US, Miami, FL',
    monitors: {
      metrics: ['Linodes'],
      alerts: [],
    },
  }),
  regionFactory.build({
    capabilities: [capabilityServiceTypeMapping['dbaas']],
    id: 'us-west',
    label: 'US, Fremont, CA',
    monitors: {
      metrics: ['Managed Databases'],
      alerts: [],
    },
  }),
  regionFactory.build({
    capabilities: [capabilityServiceTypeMapping['dbaas']],
    id: 'us-east',
    label: 'US, Newark, NJ',
    monitors: {
      metrics: ['Managed Databases'],
      alerts: [],
    },
  }),
  regionFactory.build({
    capabilities: [capabilityServiceTypeMapping['dbaas']],
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

    const errorMessage = screen.getByText('Failed to fetch Region.'); // should show regions failure only

    expect(errorMessage).not.toBeNull();
  });

  it('should render a Region Select component with capability specific', async () => {
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
        selectedDashboard={dashboardFactory.build({
          service_type: 'dbaas',
          id: 1,
        })}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Open' }));
    // example: region id => 'us-west' belongs to service type - 'dbaas', capability -'Managed Databases', and is supported
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
