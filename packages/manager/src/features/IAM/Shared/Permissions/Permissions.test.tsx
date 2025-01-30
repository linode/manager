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
});
