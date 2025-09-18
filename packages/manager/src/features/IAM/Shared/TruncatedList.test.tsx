import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { TruncatedList } from './TruncatedList';

import type { PermissionType } from '@linode/api-v4';

const mockPermissions: PermissionType[] = [
  'list_linode_firewalls',
  'list_firewall_devices',
  'view_linode_disk',
];

describe('TruncatedList', () => {
  it('renders all items with correct test ids', () => {
    const { getAllByTestId } = renderWithTheme(
      <TruncatedList dataTestId="permission">
        {mockPermissions.map((permission) => (
          <div key={permission}>{permission}</div>
        ))}
      </TruncatedList>
    );

    const allListItems = getAllByTestId('permission-list-item');
    expect(allListItems).toHaveLength(mockPermissions.length);

    mockPermissions.forEach((permission, index) => {
      expect(allListItems[index]).toHaveTextContent(permission);
    });
  });

  it('uses custom expand and collapse text', async () => {
    const { container, getByText } = renderWithTheme(
      <TruncatedList
        collapseText="Hide permissions"
        dataTestId="permission"
        expandText="Show all permissions"
      >
        {mockPermissions.map((permission) => (
          <div key={permission}>{permission}</div>
        ))}
      </TruncatedList>
    );

    expect(container).toBeInTheDocument();
    const expandText = getByText('Show all permissions (+3)');
    expect(expandText).toBeInTheDocument();

    await userEvent.click(expandText);
    const collapseText = getByText('Hide permissions');
    expect(collapseText).toBeInTheDocument();
  });
});
