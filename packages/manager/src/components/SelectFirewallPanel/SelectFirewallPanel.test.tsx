import { fireEvent, waitFor } from '@testing-library/react';
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
    permissions: { delete_firewall: true, update_firewall: true },
  })),
  useQueryWithPermissions: vi.fn().mockReturnValue({
    data: [],
    isLoading: false,
    isError: false,
  }),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.usePermissions,
  useQueryWithPermissions: queryMocks.useQueryWithPermissions,
}));

describe('SelectFirewallPanel', () => {
  it('should render', async () => {
    const wrapper = renderWithTheme(
      <SelectFirewallPanel
        entityType={undefined}
        handleFirewallChange={vi.fn()}
        helperText={<span>Testing</span>}
        selectedFirewallId={-1}
      />
    );

    await waitFor(() => {
      expect(wrapper.getByTestId(testId)).toBeInTheDocument();
    });
  });

  it('should open a Create Firewall drawer when the link is clicked in Linode Create', async () => {
    const wrapper = renderWithTheme(
      <SelectFirewallPanel
        entityType="linode"
        handleFirewallChange={vi.fn()}
        helperText={<span>Testing</span>}
        selectedFirewallId={-1}
      />
    );

    const createFirewallLink = wrapper.getByText('Create Firewall');

    fireEvent.click(createFirewallLink);

    await waitFor(() => {
      expect(
        wrapper.getByLabelText(LINODE_CREATE_FLOW_TEXT)
      ).toBeInTheDocument();
    });
  });

  it('should open a Create Firewall drawer when the link is clicked in NodeBalancer Create', async () => {
    const wrapper = renderWithTheme(
      <SelectFirewallPanel
        entityType="nodebalancer"
        handleFirewallChange={vi.fn()}
        helperText={<span>Testing</span>}
        selectedFirewallId={-1}
      />
    );

    const createFirewallLink = wrapper.getByText('Create Firewall');

    fireEvent.click(createFirewallLink);

    await waitFor(() => {
      expect(
        wrapper.getByLabelText(NODEBALANCER_CREATE_FLOW_TEXT)
      ).toBeInTheDocument();
    });
  });
});
