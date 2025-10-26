import { nodeBalancerFactory } from '@linode/utilities';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { dashboardFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { CloudPulseFirewallNodebalancersSelect } from './CloudPulseFirewallNodebalancersSelect';

import type { CloudPulseResources } from './CloudPulseResourcesSelect';

const queryMocks = vi.hoisted(() => ({
  useAllNodeBalancersQuery: vi.fn().mockReturnValue({}),
  useResourcesQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useAllNodeBalancersQuery: queryMocks.useAllNodeBalancersQuery,
  };
});

vi.mock('src/queries/cloudpulse/resources', async () => {
  const actual = await vi.importActual('src/queries/cloudpulse/resources');
  return {
    ...actual,
    useResourcesQuery: queryMocks.useResourcesQuery,
  };
});

const mockNodebalancerHandler = vi.fn();
const SELECT_ALL = 'Select All';
const ARIA_SELECTED = 'aria-selected';

const mockNodebalancers = [
  nodeBalancerFactory.build({
    id: 1,
    label: 'nodebalancer-1',
    region: 'us-east',
  }),
  nodeBalancerFactory.build({
    id: 2,
    label: 'nodebalancer-2',
    region: 'us-west',
  }),
  nodeBalancerFactory.build({
    id: 3,
    label: 'nodebalancer-3',
    region: 'us-east',
  }),
];

const mockFirewalls: CloudPulseResources[] = [
  {
    id: '1',
    label: 'firewall-1',
    entities: { '1': 'nodebalancer-1', '3': 'nodebalancer-3' },
  },
  {
    id: '2',
    label: 'firewall-2',
    entities: { '2': 'nodebalancer-2' },
  },
];

const mockDashboard = dashboardFactory.build({
  service_type: 'firewall',
  id: 8,
});

describe('CloudPulseFirewallNodebalancersSelect component tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with the correct label and placeholder', () => {
    queryMocks.useAllNodeBalancersQuery.mockReturnValue({
      data: mockNodebalancers,
      isError: false,
      isLoading: false,
    });
    queryMocks.useResourcesQuery.mockReturnValue({
      data: mockFirewalls,
      isError: false,
      isLoading: false,
    });
    renderWithTheme(
      <CloudPulseFirewallNodebalancersSelect
        handleNodebalancersSelection={mockNodebalancerHandler}
        isOptional
        label="NodeBalancers"
        selectedDashboard={mockDashboard}
        serviceType="firewall"
      />
    );

    expect(screen.getByLabelText('NodeBalancers (optional)')).toBeVisible();
    expect(screen.getByPlaceholderText('Select NodeBalancers')).toBeVisible();
  });

  it('should render disabled component when disabled prop is true', () => {
    queryMocks.useAllNodeBalancersQuery.mockReturnValue({
      data: mockNodebalancers,
      isError: false,
      isLoading: false,
    });
    queryMocks.useResourcesQuery.mockReturnValue({
      data: mockFirewalls,
      isError: false,
      isLoading: false,
    });
    renderWithTheme(
      <CloudPulseFirewallNodebalancersSelect
        disabled
        handleNodebalancersSelection={mockNodebalancerHandler}
        label="NodeBalancers"
        selectedDashboard={mockDashboard}
        serviceType="firewall"
      />
    );

    expect(screen.getByTestId('textfield-input')).toBeDisabled();
  });

  it('should render nodebalancers when data is available', async () => {
    queryMocks.useAllNodeBalancersQuery.mockReturnValue({
      data: mockNodebalancers,
      isError: false,
      isLoading: false,
    });
    queryMocks.useResourcesQuery.mockReturnValue({
      data: mockFirewalls,
      isError: false,
      isLoading: false,
    });
    renderWithTheme(
      <CloudPulseFirewallNodebalancersSelect
        handleNodebalancersSelection={mockNodebalancerHandler}
        label="NodeBalancers"
        selectedDashboard={mockDashboard}
        serviceType="firewall"
        xFilter={{ associated_entity_region: 'us-east', resource_id: '1' }}
      />
    );

    await userEvent.click(await screen.findByRole('button', { name: 'Open' }));

    // Should show nodebalancers that are associated with the selected firewall
    expect(
      await screen.findByRole('option', {
        name: 'nodebalancer-1',
      })
    ).toBeVisible();
    expect(
      await screen.findByRole('option', {
        name: 'nodebalancer-3',
      })
    ).toBeVisible();

    // Should not show nodebalancer-2 as it's not associated with firewall-1
    expect(
      screen.queryByRole('option', {
        name: 'nodebalancer-2',
      })
    ).not.toBeInTheDocument();
  });

  it('should be able to select and deselect the nodebalancers', async () => {
    queryMocks.useAllNodeBalancersQuery.mockReturnValue({
      data: mockNodebalancers,
      isError: false,
      isLoading: false,
    });
    queryMocks.useResourcesQuery.mockReturnValue({
      data: mockFirewalls,
      isError: false,
      isLoading: false,
    });
    renderWithTheme(
      <CloudPulseFirewallNodebalancersSelect
        handleNodebalancersSelection={mockNodebalancerHandler}
        label="NodeBalancers"
        savePreferences
        selectedDashboard={mockDashboard}
        serviceType="firewall"
        xFilter={{ associated_entity_region: 'us-east', resource_id: '1' }}
      />
    );

    await userEvent.click(await screen.findByRole('button', { name: 'Open' }));
    await userEvent.click(
      await screen.findByRole('option', { name: SELECT_ALL })
    );

    //  Check that nodebalancers are selected
    expect(
      await screen.findByRole('option', {
        name: 'nodebalancer-1',
      })
    ).toHaveAttribute(ARIA_SELECTED, 'true');
    expect(
      await screen.findByRole('option', {
        name: 'nodebalancer-3',
      })
    ).toHaveAttribute(ARIA_SELECTED, 'true');

    // Close the autocomplete to trigger the handler call
    await userEvent.click(await screen.findByRole('button', { name: 'Close' }));

    // Should call the handler with the selected nodebalancers
    expect(mockNodebalancerHandler).toHaveBeenCalledWith(
      [
        {
          id: '1',
          label: 'nodebalancer-1',
          associated_entity_region: 'us-east',
        },
        {
          id: '3',
          label: 'nodebalancer-3',
          associated_entity_region: 'us-east',
        },
      ],
      true
    );

    await userEvent.click(await screen.findByRole('button', { name: 'Open' }));
    await userEvent.click(
      await screen.findByRole('option', { name: 'Deselect All' })
    );

    // Check that nodebalancers are deselected
    expect(
      await screen.findByRole('option', {
        name: 'nodebalancer-1',
      })
    ).toHaveAttribute(ARIA_SELECTED, 'false');
    expect(
      await screen.findByRole('option', {
        name: 'nodebalancer-3',
      })
    ).toHaveAttribute(ARIA_SELECTED, 'false');
  });

  it('should show appropriate error message on nodebalancers call failure', async () => {
    queryMocks.useAllNodeBalancersQuery.mockReturnValue({
      data: null,
      isError: true,
      isLoading: false,
    });
    queryMocks.useResourcesQuery.mockReturnValue({
      data: mockFirewalls,
      isError: false,
      isLoading: false,
    });
    renderWithTheme(
      <CloudPulseFirewallNodebalancersSelect
        handleNodebalancersSelection={mockNodebalancerHandler}
        label="NodeBalancers"
        selectedDashboard={mockDashboard}
        serviceType="firewall"
      />
    );

    // The error message should be visible immediately when isError is true
    expect(screen.getByText('Failed to fetch NodeBalancers.')).toBeVisible();
  });

  it('should filter nodebalancers based on xFilter and firewalls', async () => {
    queryMocks.useAllNodeBalancersQuery.mockReturnValue({
      data: mockNodebalancers,
      isError: false,
      isLoading: false,
    });
    queryMocks.useResourcesQuery.mockReturnValue({
      data: mockFirewalls,
      isError: false,
      isLoading: false,
    });
    renderWithTheme(
      <CloudPulseFirewallNodebalancersSelect
        handleNodebalancersSelection={mockNodebalancerHandler}
        label="NodeBalancers"
        selectedDashboard={mockDashboard}
        serviceType="firewall"
        xFilter={{ associated_entity_region: 'us-east', resource_id: '1' }}
      />
    );

    await userEvent.click(await screen.findByRole('button', { name: 'Open' }));

    // Should only show nodebalancers associated with firewall-1 in us-east
    expect(
      await screen.findByRole('option', {
        name: 'nodebalancer-1',
      })
    ).toBeVisible();
    expect(
      await screen.findByRole('option', {
        name: 'nodebalancer-3',
      })
    ).toBeVisible();

    // Should not show nodebalancer-2 (associated with firewall-2)
    expect(
      screen.queryByRole('option', {
        name: 'nodebalancer-2',
      })
    ).not.toBeInTheDocument();
  });

  it('should handle default values correctly', async () => {
    queryMocks.useAllNodeBalancersQuery.mockReturnValue({
      data: mockNodebalancers,
      isError: false,
      isLoading: false,
    });
    queryMocks.useResourcesQuery.mockReturnValue({
      data: mockFirewalls,
      isError: false,
      isLoading: false,
    });

    const defaultValue = ['1', '3']; // IDs of nodebalancers to select by default

    renderWithTheme(
      <CloudPulseFirewallNodebalancersSelect
        defaultValue={defaultValue}
        handleNodebalancersSelection={mockNodebalancerHandler}
        label="NodeBalancers"
        savePreferences={true}
        selectedDashboard={mockDashboard}
        serviceType="firewall"
        xFilter={{ associated_entity_region: 'us-east', resource_id: '1' }}
      />
    );

    await userEvent.click(await screen.findByRole('button', { name: 'Open' }));

    // Should show that nodebalancer-1 and nodebalancer-3 are selected by default
    expect(
      await screen.findByRole('option', {
        name: 'nodebalancer-1',
      })
    ).toHaveAttribute(ARIA_SELECTED, 'true');
    expect(
      await screen.findByRole('option', {
        name: 'nodebalancer-3',
      })
    ).toHaveAttribute(ARIA_SELECTED, 'true');
  });
});
