import * as React from 'react';

import { firewallFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { NodeBalancerFirewalls } from './NodeBalancerFirewalls';

const firewall = firewallFactory.build({ label: 'mock-firewall-1' });

// Set up various mocks for tests

const navigate = vi.fn();
const queryMocks = vi.hoisted(() => ({
  useMatch: vi.fn(() => ({})),
  useNavigate: vi.fn(() => navigate),
  useNodeBalancersFirewallsQuery: vi.fn().mockReturnValue({ data: undefined }),
  useParams: vi.fn(() => ({})),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useNodeBalancersFirewallsQuery: queryMocks.useNodeBalancersFirewallsQuery,
  };
});

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useMatch: queryMocks.useMatch,
    useNavigate: queryMocks.useNavigate,
    useParams: queryMocks.useParams,
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
    queryMocks.useParams.mockReturnValue({
      id: '1',
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
