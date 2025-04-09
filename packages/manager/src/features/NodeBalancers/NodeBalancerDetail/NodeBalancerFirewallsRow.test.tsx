import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { firewallFactory } from 'src/factories';
import { checkIfUserCanModifyFirewall } from 'src/features/Firewalls/shared';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { NodeBalancerFirewallsRow } from './NodeBalancerFirewallsRow';

const firewall = firewallFactory.build({ label: 'mock-firewall-1' });

// Set up various mocks for tests
vi.mock('src/features/Firewalls/shared');

const queryMocks = vi.hoisted(() => ({
  useNodeBalancersFirewallsQuery: vi.fn().mockReturnValue({ data: undefined }),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useNodeBalancersFirewallsQuery: queryMocks.useNodeBalancersFirewallsQuery,
  };
});

const props = {
  devices: [],
  firewall,
  nodeBalancerId: 1,
  onClickUnassign: vi.fn(),
};

describe('NodeBalancerFirewallsRow', () => {
  beforeEach(() => {
    vi.mocked(checkIfUserCanModifyFirewall).mockReturnValue(true);
    queryMocks.useNodeBalancersFirewallsQuery.mockReturnValue({
      data: { data: [firewall] },
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders the NodeBalancerFirewallsRow', () => {
    const { getByText } = renderWithTheme(
      <NodeBalancerFirewallsRow {...props} />
    );

    expect(getByText('mock-firewall-1')).toBeVisible();
    expect(getByText('Enabled')).toBeVisible();
    expect(getByText('1 Inbound / 1 Outbound')).toBeVisible();
    expect(getByText('Unassign')).toBeVisible();
  });

  it('unassigns the firewall', async () => {
    const { getByText } = renderWithTheme(
      <NodeBalancerFirewallsRow {...props} />
    );

    const unassignButton = getByText('Unassign');
    await userEvent.click(unassignButton);
    expect(props.onClickUnassign).toHaveBeenCalled();
  });

  it('disables unassigning the firewall if user cannot modify firewall', async () => {
    vi.mocked(checkIfUserCanModifyFirewall).mockReturnValue(false);
    const { getByTestId } = renderWithTheme(
      <NodeBalancerFirewallsRow {...props} />
    );

    const unassignButton = getByTestId('button');
    expect(unassignButton).toBeDisabled();
    await userEvent.click(unassignButton);
    expect(props.onClickUnassign).not.toHaveBeenCalled();
  });
});
