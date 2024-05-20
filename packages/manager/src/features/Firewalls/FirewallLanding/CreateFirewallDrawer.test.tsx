import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CreateFirewallDrawer } from './CreateFirewallDrawer';

const props = {
  createFlow: undefined,
  onClose: vi.fn(),
  onFirewallCreated: vi.fn(),
  open: true,
};

describe('Create Firewall Drawer', () => {
  it('should close the drawer on cancel', async () => {
    renderWithTheme(<CreateFirewallDrawer {...props} />);
    await userEvent.click(screen.getByTestId('cancel'));
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it('should render a title', () => {
    renderWithTheme(<CreateFirewallDrawer {...props} />);
    const title = within(screen.getByTestId('drawer-title')).getByText(
      'Create Firewall'
    );
    expect(title).toBeVisible();
  });

  it('should render radio buttons for default inbound/outbound policies', () => {
    renderWithTheme(<CreateFirewallDrawer {...props} />);
    const withinInboundPolicy = within(
      screen.getByTestId('default-inbound-policy')
    );
    expect(withinInboundPolicy.getByText('Accept')).toBeVisible();
    expect(withinInboundPolicy.getByText('Drop')).toBeVisible();
    expect(withinInboundPolicy.getByLabelText('Drop')).toBeChecked();

    const withinOutboundPolicy = within(
      screen.getByTestId('default-outbound-policy')
    );
    expect(withinOutboundPolicy.getByText('Accept')).toBeVisible();
    expect(withinOutboundPolicy.getByLabelText('Accept')).toBeChecked();
    expect(withinOutboundPolicy.getByText('Drop')).toBeVisible();
  });

  it('should validate the form on submit', async () => {
    renderWithTheme(<CreateFirewallDrawer {...props} />);
    await userEvent.type(screen.getByLabelText('Label (required)'), 'a');
    await userEvent.click(screen.getByTestId('submit'));
    const error = await screen.findByText(
      /Label must be between 3 and 32 characters./i
    );
    expect(error).toBeInTheDocument();
  });
});
