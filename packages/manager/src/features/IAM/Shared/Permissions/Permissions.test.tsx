import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { Permissions } from './Permissions';

import type { PermissionType } from '@linode/api-v4/lib/iam/types';

const mockPermissions: PermissionType[] = ['cancel_account'];

const mockPermissionsLong: PermissionType[] = [
  'list_payments',
  'list_invoices',
  'list_payment_methods',
  'view_invoice',
  'list_invoice_items',
  'view_payment_method',
  'view_payment',
];

const mockPermissionsLongExpand: PermissionType[] = [
  'list_linode_firewalls',
  'view_linode_networking_info',
  'view_linode_disk',
  'view_linode_monthly_network_transfer_stats',
  'view_linode_network_transfer',
  'view_linode_stats',
  'view_linode_backup',
  'list_linode_volumes',
  'view_linode',
  'list_linode_nodebalancers',
  'view_linode_monthly_stats',
  'view_linode_config_profile',
  'view_linode_ip_address',
  'view_linode_config_profile_interface',
];

describe('Permissions', () => {
  it('renders the correct number of permission chips', () => {
    const { getAllByTestId, getByText } = renderWithTheme(
      <Permissions permissions={mockPermissions} />
    );

    const chips = getAllByTestId('permission');
    expect(chips).toHaveLength(1);

    expect(getByText('cancel_account')).toBeInTheDocument();
  });

  it('renders the title', () => {
    const { getByText } = renderWithTheme(
      <Permissions permissions={mockPermissions} />
    );

    expect(getByText('Permissions')).toBeInTheDocument();
  });

  it('renders the correct number of permission chips', () => {
    const { getAllByTestId } = renderWithTheme(
      <Permissions permissions={mockPermissionsLong} />
    );

    const chips = getAllByTestId('permission');
    expect(chips).toHaveLength(mockPermissionsLong.length);
  });

  it('renders a message when there are no permissions', () => {
    renderWithTheme(<Permissions permissions={[]} />);

    screen.getByText(
      'This role doesn’t include permissions. Refer to the role description to understand what access is granted by this role.'
    );
  });
});

describe('useCalculateHiddenItems', () => {
  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      get() {
        if (this.dataset?.testid === 'container') return 40;
        return 10;
      },
    });
    let permissionIndex = 0;
    HTMLElement.prototype.getBoundingClientRect = function () {
      const testId = this.dataset?.testid;
      if (testId === 'container') {
        return { top: 0, bottom: 42, height: 42 } as DOMRect;
      }

      if (testId === 'permission') {
        const top = Math.floor(permissionIndex / 13) * 20;
        permissionIndex++;
        return {
          top,
          bottom: top + 10,
          height: 10,
        } as DOMRect;
      }
      return { top: 0, bottom: 10, height: 10 } as DOMRect;
    };

    window.requestAnimationFrame = (cb) => {
      cb(Date.now());
      return 0;
    };
    window.cancelAnimationFrame = () => {};
  });

  it('shows correct number of hidden permissions', async () => {
    renderWithTheme(<Permissions permissions={mockPermissionsLongExpand} />);

    const hiddenCount = await screen.findByText('Expand', { exact: false });

    await waitFor(() => {
      expect(hiddenCount).toHaveTextContent('+1');
    });
  });

  it('shows all permissions when expanded', async () => {
    renderWithTheme(<Permissions permissions={mockPermissionsLongExpand} />);

    const expandButton = await screen.findByText('Expand', { exact: false });
    await userEvent.click(expandButton);

    await waitFor(() => {
      const allPermissions = screen.getAllByTestId('permission');
      expect(allPermissions).toHaveLength(mockPermissionsLongExpand.length);
    });
  });
  it('toggles between expand and hide', async () => {
    renderWithTheme(<Permissions permissions={mockPermissionsLongExpand} />);

    const expandButton = await screen.findByText('Expand', { exact: false });
    await userEvent.click(expandButton);

    await waitFor(() => {
      const hideButton = screen.getByText(/hide/i);
      expect(hideButton).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText(/hide/i));

    await waitFor(() => {
      const expandButton = screen.getByText('Expand', { exact: false });
      expect(expandButton).toBeInTheDocument();
    });
  });
  it('not shows expand button when permissions fit', async () => {
    renderWithTheme(<Permissions permissions={mockPermissions} />);

    const expandButton = screen.queryByText('Expand', { exact: false });
    expect(expandButton).not.toBeInTheDocument();
  });
});
