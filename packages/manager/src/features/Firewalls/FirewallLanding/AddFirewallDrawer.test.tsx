import * as React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithTheme } from 'src/utilities/testHelpers';
import AddFirewallDrawer, { CombinedProps } from './AddFirewallDrawer';
import { predefinedFirewalls } from '../shared';

const props: CombinedProps = {
  onClose: jest.fn(),
  onSubmit: jest.fn().mockResolvedValue({}),
  title: 'Add a Firewall',
  open: true,
};

describe('Add Firewall Drawer', () => {
  it('should render a title', () => {
    renderWithTheme(<AddFirewallDrawer {...props} />);
    expect(screen.getByText(/add a firewall/i)).toBeInTheDocument();
  });

  it('should validate the form on submit', async () => {
    renderWithTheme(<AddFirewallDrawer {...props} />);
    userEvent.type(screen.getByLabelText('Label'), 'a');
    userEvent.click(screen.getByTestId('add-firewall-submit'));
    const error = await screen.findByText(
      /Label must be between 3 and 32 characters./i
    );
    expect(error).toBeInTheDocument();
  });

  it('should add default rules for ssh and dns', async () => {
    renderWithTheme(<AddFirewallDrawer {...props} />);
    const label = '123abc!@#';
    userEvent.type(screen.getByLabelText('Label'), label);
    userEvent.click(screen.getByTestId('add-firewall-submit'));
    await waitFor(() =>
      expect(props.onSubmit).toHaveBeenCalledWith({
        devices: {
          linodes: [],
        },
        label,
        rules: {
          inbound_policy: 'DROP',
          outbound_policy: 'ACCEPT',
          inbound: [
            ...predefinedFirewalls.ssh.inbound,
            ...predefinedFirewalls.dns.inbound,
          ],
        },
      })
    );
  });
});
