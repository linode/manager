import { fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';
import { QueryClient } from 'react-query';

import {
  LINODE_CREATE_FLOW_TEXT,
  NODEBALANCER_CREATE_FLOW_TEXT,
} from 'src/features/Firewalls/FirewallLanding/CreateFirewallDrawer';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { SelectFirewallPanel } from './SelectFirewallPanel';

const queryClient = new QueryClient();

beforeAll(() => mockMatchMedia());
afterEach(() => {
  queryClient.clear();
});

const testId = 'select-firewall-panel';

describe('SelectFirewallPanel', () => {
  it('should render', async () => {
    const wrapper = renderWithTheme(
      <SelectFirewallPanel
        handleFirewallChange={vi.fn()}
        helperText={<span>Testing</span>}
        selectedFirewallId={-1}
      />,
      {
        queryClient,
      }
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
      />,
      {
        queryClient,
      }
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
      />,
      {
        queryClient,
      }
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
