import userEvent from '@testing-library/user-event';
import * as React from 'react';

import {
  LINODE_CREATE_FLOW_TEXT,
  NODEBALANCER_CREATE_FLOW_TEXT,
} from 'src/features/Firewalls/FirewallLanding/constants';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { SelectFirewallPanel } from './SelectFirewallPanel';

beforeAll(() => mockMatchMedia());

const testId = 'select-firewall-panel';

const queryMocks = vi.hoisted(() => ({
  usePermissions: vi.fn(() => ({
    data: { delete_firewall: true, update_firewall: true },
  })),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.usePermissions,
}));

describe('SelectFirewallPanel', () => {
  it('should render', async () => {
    const { getByTestId } = renderWithTheme(
      <SelectFirewallPanel
        entityType={undefined}
        handleFirewallChange={vi.fn()}
        helperText={<span>Testing</span>}
        permissions={{ create_firewall: true, create_nodebalancer: true }}
        selectedFirewallId={-1}
      />
    );

    const id = getByTestId(testId);
    expect(id).toBeInTheDocument();
  });

  it('should open a Create Firewall drawer when the link is clicked in Linode Create', async () => {
    const { getByLabelText, getByText } = renderWithTheme(
      <SelectFirewallPanel
        entityType="linode"
        handleFirewallChange={vi.fn()}
        helperText={<span>Testing</span>}
        permissions={{ create_firewall: true, create_nodebalancer: true }}
        selectedFirewallId={-1}
      />
    );

    const createFirewallLink = getByText('Create Firewall');

    await userEvent.click(createFirewallLink);

    const labelText = getByLabelText(LINODE_CREATE_FLOW_TEXT);
    expect(labelText).toBeInTheDocument();
  });

  it('should open a Create Firewall drawer when the link is clicked in NodeBalancer Create', async () => {
    const { getByLabelText, getByText } = renderWithTheme(
      <SelectFirewallPanel
        entityType="nodebalancer"
        handleFirewallChange={vi.fn()}
        helperText={<span>Testing</span>}
        permissions={{ create_firewall: true, create_nodebalancer: true }}
        selectedFirewallId={-1}
      />
    );

    const createFirewallLink = getByText('Create Firewall');

    await userEvent.click(createFirewallLink);

    const labelText = getByLabelText(NODEBALANCER_CREATE_FLOW_TEXT);
    expect(labelText).toBeInTheDocument();
  });

  it('should disable "Create Firewall" link if user does not have create_firewall permission', async () => {
    const { getByText } = renderWithTheme(
      <SelectFirewallPanel
        entityType="nodebalancer"
        handleFirewallChange={vi.fn()}
        helperText={<span>Testing</span>}
        permissions={{ create_firewall: false, create_nodebalancer: true }}
        selectedFirewallId={-1}
      />
    );

    const createFirewallLink = getByText('Create Firewall');
    expect(createFirewallLink).toBeDisabled();
  });
});
