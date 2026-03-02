import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { vpcFactory } from 'src/factories';
import {
  renderWithTheme,
  renderWithThemeAndHookFormContext,
} from 'src/utilities/testHelpers';

import { SubnetCreateDrawer } from './SubnetCreateDrawer';

const queryMocks = vi.hoisted(() => ({
  useAccount: vi.fn().mockReturnValue({}),
  useVPCQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useVPCQuery: queryMocks.useVPCQuery,
    useAccount: queryMocks.useAccount,
  };
});

const props = {
  onClose: vi.fn(),
  open: true,
  vpcId: 1,
};

describe('Create Subnet Drawer', () => {
  it('should render title, label, ipv4 input, ipv4 availability, and action buttons', () => {
    renderWithTheme(<SubnetCreateDrawer {...props} />);

    const createHeading = screen.getByRole('heading', {
      name: 'Create Subnet',
    });
    expect(createHeading).toBeVisible();
    const createButton = screen.getByRole('button', { name: 'Create Subnet' });
    expect(createButton).toBeVisible();
    expect(createButton).toBeDisabled();

    const label = screen.getByText('Subnet Label');
    expect(label).toBeVisible();
    expect(label).toBeEnabled();

    const ipv4Input = screen.getByText('Subnet IP Address Range');
    expect(ipv4Input).toBeVisible();
    expect(ipv4Input).toBeEnabled();

    const saveButton = screen.getByTestId('create-subnet-drawer-button');
    expect(saveButton).toBeVisible();

    const cancelBtn = screen.getByText(/Cancel/);
    expect(cancelBtn).not.toHaveAttribute('aria-disabled', 'true');
    expect(cancelBtn).toBeVisible();
  });

  it('should close the drawer if the close cancel button is clicked', async () => {
    renderWithTheme(<SubnetCreateDrawer {...props} />);

    const cancelBtn = screen.getByText(/Cancel/);
    expect(cancelBtn).not.toHaveAttribute('aria-disabled', 'true');
    expect(cancelBtn).toBeVisible();

    await userEvent.click(cancelBtn);
    expect(props.onClose).toHaveBeenCalled();
  });

  it('should render the ipv6 cidr input if the VPC is DualStack and vpcIpv6 feature flag is enabled', () => {
    queryMocks.useVPCQuery.mockReturnValue({
      data: vpcFactory.build({ ipv6: [{ range: '2600:3c03:e400:1000::/52' }] }),
    });
    queryMocks.useAccount.mockReturnValue({
      data: {
        capabilities: ['VPC Dual Stack'],
      },
    });

    renderWithThemeAndHookFormContext({
      component: <SubnetCreateDrawer {...props} />,
      options: {
        flags: {
          vpcIpv6: true,
        },
      },
    });

    const ipv4Input = screen.getByText('Subnet IPv4 Range (CIDR)');
    expect(ipv4Input).toBeVisible();
    expect(ipv4Input).toBeEnabled();

    const ipv6input = screen.getByText('IPv6 Prefix Length');
    expect(ipv6input).toBeVisible();
    expect(ipv6input).toBeEnabled();
  });

  it('should not render the ipv6 cidr input if the VPC is not DualStack', () => {
    queryMocks.useVPCQuery.mockReturnValue({
      data: vpcFactory.build(),
    });
    queryMocks.useAccount.mockReturnValue({
      data: {
        capabilities: ['VPC Dual Stack'],
      },
    });

    renderWithThemeAndHookFormContext({
      component: <SubnetCreateDrawer {...props} />,
      options: {
        flags: {
          vpcIpv6: true,
        },
      },
    });

    expect(screen.queryByText('IPv6 Prefix Length')).not.toBeInTheDocument();
  });
});
