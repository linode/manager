import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { accountFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { CreateFirewallDrawer } from './CreateFirewallDrawer';

const queryMocks = vi.hoisted(() => ({
  useAccount: vi.fn().mockReturnValue({}),
  usePermissions: vi.fn().mockReturnValue({
    data: { create_firewall: true },
    isLoading: false,
    error: null,
  }),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useAccount: queryMocks.useAccount,
  };
});

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.usePermissions,
}));

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

  it('should always show the label field', () => {
    renderWithTheme(<CreateFirewallDrawer {...props} />);
    const label = screen.getByText('Label');
    expect(label).toBeVisible();
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

  it('shows custom firewall radio group if Linode Interfaces is enabled and can toggle radio group', async () => {
    queryMocks.useAccount.mockReturnValue({
      data: accountFactory.build({
        capabilities: ['Linode Interfaces'],
      }),
      isLoading: false,
      error: null,
    });

    const { getByLabelText, findByTestId } = renderWithTheme(
      <CreateFirewallDrawer {...props} />,
      {
        flags: { linodeInterfaces: { enabled: true } },
      }
    );

    const createFirewallForm = await findByTestId(
      'create-firewall-from-radio-group'
    );

    expect(createFirewallForm).toBeVisible();

    const templateRadio = getByLabelText('From a Template');
    await userEvent.click(templateRadio);
    expect(getByLabelText('Firewall Template')).toBeVisible();
  });

  it('should not show the custom firewall radio group if Linode Interfaces flag is not enabled', () => {
    const { queryByLabelText, queryByTestId } = renderWithTheme(
      <CreateFirewallDrawer {...props} />,
      {
        flags: { linodeInterfaces: { enabled: false } },
      }
    );

    expect(
      queryByTestId('create-firewall-from-radio-group')
    ).not.toBeInTheDocument();
    expect(queryByLabelText('Firewall Template')).not.toBeInTheDocument();
  });

  it('enables the submit button if the user has create_firewall permission', () => {
    queryMocks.usePermissions.mockReturnValue({
      data: { create_firewall: true },
      isLoading: false,
      error: null,
    });

    renderWithTheme(<CreateFirewallDrawer {...props} />);
    const submitButton = screen.getByTestId('submit');
    expect(submitButton).toBeEnabled();
  });

  it('disables the submit button if the user does not have create_firewall permission', () => {
    queryMocks.usePermissions.mockReturnValue({
      data: { create_firewall: false },
      isLoading: false,
      error: null,
    });

    renderWithTheme(<CreateFirewallDrawer {...props} />);
    const submitButton = screen.getByTestId('submit');
    expect(submitButton).toBeDisabled();
  });
});
