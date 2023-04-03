import * as React from 'react';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithTheme } from 'src/utilities/testHelpers';
import CreateFirewallDrawer from './CreateFirewallDrawer';

const props = {
  onClose: jest.fn(),
  open: true,
};

describe('Create Firewall Drawer', () => {
  it('should render a title', () => {
    renderWithTheme(<CreateFirewallDrawer {...props} />);
    const title = within(screen.getByTestId('drawer-title')).getByText(
      'Create Firewall'
    );
    expect(title).toBeVisible();
  });

  it('should validate the form on submit', async () => {
    renderWithTheme(<CreateFirewallDrawer {...props} />);
    userEvent.type(screen.getByLabelText('Label'), 'a');
    userEvent.click(screen.getByTestId('create-firewall-submit'));
    const error = await screen.findByText(
      /Label must be between 3 and 32 characters./i
    );
    expect(error).toBeInTheDocument();
  });
});
