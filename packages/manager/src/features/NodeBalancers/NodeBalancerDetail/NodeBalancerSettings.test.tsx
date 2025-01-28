import * as React from 'react';

import { firewallFactory, nodeBalancerFactory } from 'src/factories';
import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { NodeBalancerSettings } from './NodeBalancerSettings';

// Set up various mocks for tests
vi.mock('src/hooks/useIsResourceRestricted');

const queryMocks = vi.hoisted(() => ({
  useNodeBalancerQuery: vi.fn().mockReturnValue({ data: undefined }),
  useNodeBalancersFirewallsQuery: vi.fn().mockReturnValue({ data: undefined }),
}));

vi.mock('src/queries/nodebalancers', async () => {
  const actual = await vi.importActual('src/queries/nodebalancers');
  return {
    ...actual,
    useNodeBalancerQuery: queryMocks.useNodeBalancerQuery,
    useNodeBalancersFirewallsQuery: queryMocks.useNodeBalancersFirewallsQuery,
  };
});

const connectionThrottle = 'Connection Throttle';

describe('NodeBalancerSettings', () => {
  beforeEach(() => {
    queryMocks.useNodeBalancerQuery.mockReturnValue({
      data: nodeBalancerFactory.build(),
    });
    queryMocks.useNodeBalancersFirewallsQuery.mockReturnValue({
      data: { data: [firewallFactory.build({ label: 'mock-firewall-1' })] },
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders the NodeBalancerSettings component', () => {
    const {
      getAllByText,
      getByLabelText,
      getByTestId,
      getByText,
    } = renderWithTheme(<NodeBalancerSettings />);

    // NodeBalancer Label panel
    expect(getByText('NodeBalancer Label')).toBeVisible();
    expect(getByText('Label')).toBeVisible();
    expect(getByLabelText('Label')).not.toBeDisabled();

    // Firewall panel
    expect(getByText('Firewalls')).toBeVisible();
    expect(getByText('Status')).toBeVisible();
    expect(getByText('Rules')).toBeVisible();
    expect(getByText('mock-firewall-1')).toBeVisible();
    expect(getByText('Enabled')).toBeVisible();
    expect(getByText('1 Inbound / 1 Outbound')).toBeVisible();
    expect(getByText('Unassign')).toBeVisible();

    // Client Connection Throttle panel
    expect(getByText('Client Connection Throttle')).toBeVisible();
    expect(getByText(connectionThrottle)).toBeVisible();
    expect(getByLabelText(connectionThrottle)).not.toBeDisabled();
    expect(
      getByText(
        'To help mitigate abuse, throttle connections from a single client IP to this number per second. 0 to disable.'
      )
    ).toBeVisible();
    expect(getAllByText('Save')).toHaveLength(2);

    // Delete panel
    expect(getByText('Delete NodeBalancer')).toBeVisible();
    expect(getByText('Delete')).toBeVisible();
    expect(getByTestId('delete-nodebalancer')).not.toBeDisabled();
  });

  it('disables inputs and buttons if the Node Balancer is read only', () => {
    vi.mocked(useIsResourceRestricted).mockReturnValue(true);
    const { getByLabelText, getByTestId } = renderWithTheme(
      <NodeBalancerSettings />
    );

    expect(getByLabelText('Label')).toBeDisabled();
    expect(getByLabelText(connectionThrottle)).toBeDisabled();
    expect(getByTestId('delete-nodebalancer')).toBeDisabled();
  });
});
