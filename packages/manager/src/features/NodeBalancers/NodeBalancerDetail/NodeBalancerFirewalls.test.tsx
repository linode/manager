import * as React from 'react';

import { firewallFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { NodeBalancerFirewalls } from './NodeBalancerFirewalls';

const firewall = firewallFactory.build({ label: 'mock-firewall-1' });

// Set up various mocks for tests

const queryMocks = vi.hoisted(() => ({
  useNodeBalancersFirewallsQuery: vi.fn().mockReturnValue({ data: undefined }),
}));

vi.mock('src/queries/nodebalancers', async () => {
  const actual = await vi.importActual('src/queries/nodebalancers');
  return {
    ...actual,
    useNodeBalancersFirewallsQuery: queryMocks.useNodeBalancersFirewallsQuery,
  };
});

const props = {
  displayFirewallInfoText: false,
  nodeBalancerId: 1,
};

describe('NodeBalancerFirewalls', () => {
  beforeEach(() => {
    queryMocks.useNodeBalancersFirewallsQuery.mockReturnValue({
      data: { data: [firewall] },
      isLoading: false,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders the Firewall table', () => {
    const { getByText } = renderWithTheme(<NodeBalancerFirewalls {...props} />);

    expect(getByText('Status')).toBeVisible();
    expect(getByText('Rules')).toBeVisible();
    expect(getByText('mock-firewall-1')).toBeVisible();
    expect(getByText('Enabled')).toBeVisible();
    expect(getByText('1 Inbound / 1 Outbound')).toBeVisible();
    expect(getByText('Unassign')).toBeVisible();
  });

  it('displays a loading placeholder', () => {
    queryMocks.useNodeBalancersFirewallsQuery.mockReturnValue({
      data: { data: [firewall] },
      isLoading: true,
    });
    const { getByTestId, getByText } = renderWithTheme(
      <NodeBalancerFirewalls {...props} />
    );

    // headers still exist
    expect(getByText('Status')).toBeVisible();
    expect(getByText('Rules')).toBeVisible();

    // table is loading
    expect(getByTestId('table-row-loading')).toBeVisible();
  });

  it('displays an error for the firewall table', () => {
    queryMocks.useNodeBalancersFirewallsQuery.mockReturnValue({
      data: { data: [firewall] },
      error: [{ reason: 'This is a firewall table error.' }],
      isLoading: false,
    });
    const { getByText } = renderWithTheme(<NodeBalancerFirewalls {...props} />);

    // headers still exist
    expect(getByText('Status')).toBeVisible();
    expect(getByText('Rules')).toBeVisible();

    // error message displays if there was an error getting firewalls
    expect(getByText('This is a firewall table error.')).toBeVisible();
  });

  it('shows that no firewalls are assigned', () => {
    queryMocks.useNodeBalancersFirewallsQuery.mockReturnValue({
      data: { data: [] },
      isLoading: false,
    });
    const { getByText } = renderWithTheme(<NodeBalancerFirewalls {...props} />);

    // headers still exist
    expect(getByText('Status')).toBeVisible();
    expect(getByText('Rules')).toBeVisible();

    // no firewalls exist
    expect(getByText('No Firewalls are assigned.')).toBeVisible();
  });
});
