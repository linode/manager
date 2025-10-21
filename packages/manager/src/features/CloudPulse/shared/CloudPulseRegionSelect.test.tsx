import { capabilityServiceTypeMapping } from '@linode/api-v4';
import {
  linodeFactory,
  nodeBalancerFactory,
  regionFactory,
} from '@linode/utilities';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import {
  dashboardFactory,
  databaseInstanceFactory,
  firewallFactory,
} from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { NO_REGION_MESSAGE } from '../Utils/constants';
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
  useAllLinodesQuery: vi.fn().mockReturnValue({}),
  useAllNodeBalancersQuery: vi.fn().mockReturnValue({}),
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
  useAllLinodesQuery: queryMocks.useAllLinodesQuery,
  useAllNodeBalancersQuery: queryMocks.useAllNodeBalancersQuery,
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

  it('should render a Region Select component with correct info message when no regions are available for dbaas service type', async () => {
    const user = userEvent.setup();
    queryMocks.useResourcesQuery.mockReturnValue({
      data: databaseInstanceFactory.buildList(3, {
        region: 'ap-west',
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
    expect(screen.getByText(NO_REGION_MESSAGE[1])).toBeVisible();
  });

  it('should render a Region Select component with correct info message when no regions are available for linode service type', async () => {
    const user = userEvent.setup();
    queryMocks.useResourcesQuery.mockReturnValue({
      data: linodeFactory.buildList(2, {
        region: 'ap-west',
      }),
      isError: false,
      isLoading: false,
    });
    renderWithTheme(
      <CloudPulseRegionSelect
        {...props}
        selectedDashboard={dashboardFactory.build({
          service_type: 'linode',
          id: 2,
        })}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByText(NO_REGION_MESSAGE[2])).toBeVisible();
  });

  it('should render a Region Select component with correct info message when no regions are available for nodebalancer service type', async () => {
    const user = userEvent.setup();
    queryMocks.useResourcesQuery.mockReturnValue({
      data: nodeBalancerFactory.buildList(3, {
        region: 'ap-west',
      }),
      isError: false,
      isLoading: false,
    });
    renderWithTheme(
      <CloudPulseRegionSelect
        {...props}
        selectedDashboard={dashboardFactory.build({
          service_type: 'nodebalancer',
          id: 3,
        })}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByText(NO_REGION_MESSAGE[3])).toBeVisible();
  });

  it('should render a Region Select component with correct info message when no regions are available for firewall service type', async () => {
    const user = userEvent.setup();
    // There are no aclp supported regions for firewall service type as returned by useRegionsQuery above
    renderWithTheme(
      <CloudPulseRegionSelect
        {...props}
        selectedDashboard={dashboardFactory.build({
          service_type: 'firewall',
          id: 4,
        })}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByText(NO_REGION_MESSAGE[4])).toBeVisible();
  });

  it('Should show the correct linode region in the dropdown for firewall service type when savePreferences is true', async () => {
    const user = userEvent.setup();
    queryMocks.useRegionsQuery.mockReturnValue({
      data: [
        regionFactory.build({
          id: 'ap-west',
          label: 'IN, Mumbai',
          capabilities: [capabilityServiceTypeMapping['firewall']],
        }),
      ],
      isError: false,
      isLoading: false,
    });
    queryMocks.useResourcesQuery.mockReturnValue({
      data: [
        firewallFactory.build({
          id: 1,
          entities: [{ id: 1, type: 'linode' }],
        }),
      ],
      isError: false,
      isLoading: false,
    });
    queryMocks.useAllLinodesQuery.mockReturnValue({
      data: [
        linodeFactory.build({
          id: 1,
          region: 'ap-west',
        }),
      ],
      isError: false,
      isLoading: false,
    });

    renderWithTheme(
      <CloudPulseRegionSelect
        {...props}
        filterKey="associated_entity_region"
        savePreferences={true}
        selectedDashboard={dashboardFactory.build({
          service_type: 'firewall',
          id: 4,
        })}
        selectedEntities={['1']}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(
      screen.getByRole('option', { name: 'IN, Mumbai (ap-west)' })
    ).toBeVisible();
  });

  it('Should select the first region automatically from the linode regions if savePreferences is false', async () => {
    queryMocks.useRegionsQuery.mockReturnValue({
      data: [
        regionFactory.build({
          id: 'ap-west',
          label: 'IN, Mumbai',
          capabilities: [capabilityServiceTypeMapping['firewall']],
        }),
      ],
      isError: false,
      isLoading: false,
    });
    queryMocks.useResourcesQuery.mockReturnValue({
      data: [
        firewallFactory.build({
          id: 1,
          entities: [{ id: 1, type: 'linode' }],
        }),
      ],
      isError: false,
      isLoading: false,
    });
    queryMocks.useAllLinodesQuery.mockReturnValue({
      data: [
        linodeFactory.build({
          id: 1,
          region: 'ap-west',
        }),
      ],
      isError: false,
      isLoading: false,
    });
    renderWithTheme(
      <CloudPulseRegionSelect
        {...props}
        filterKey="associated_entity_region"
        savePreferences={false}
        selectedDashboard={dashboardFactory.build({
          service_type: 'firewall',
          id: 4,
        })}
        selectedEntities={['1']}
      />
    );
    expect(screen.getByDisplayValue('IN, Mumbai (ap-west)')).toBeVisible();
  });
  it('Should select the first region automatically from the nodebalancer regions if savePreferences is false', async () => {
    queryMocks.useRegionsQuery.mockReturnValue({
      data: [
        regionFactory.build({
          id: 'ap-west',
          label: 'IN, Mumbai',
          capabilities: [capabilityServiceTypeMapping['firewall']],
        }),
      ],
      isError: false,
      isLoading: false,
    });
    queryMocks.useResourcesQuery.mockReturnValue({
      data: [
        firewallFactory.build({
          id: 1,
          entities: [{ id: 1, type: 'nodebalancer' }],
        }),
      ],
      isError: false,
      isLoading: false,
    });
    queryMocks.useAllNodeBalancersQuery.mockReturnValue({
      data: [
        nodeBalancerFactory.build({
          id: 1,
          region: 'ap-west',
        }),
      ],
      isError: false,
      isLoading: false,
    });
    renderWithTheme(
      <CloudPulseRegionSelect
        {...props}
        filterKey="associated_entity_region"
        savePreferences={false}
        selectedDashboard={dashboardFactory.build({
          service_type: 'firewall',
          id: 8,
        })}
        selectedEntities={['1']}
      />
    );
    expect(screen.getByDisplayValue('IN, Mumbai (ap-west)')).toBeVisible();
  });
});
