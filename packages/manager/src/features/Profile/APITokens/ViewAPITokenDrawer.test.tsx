import * as React from 'react';

import { appTokenFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ViewAPITokenDrawer } from './ViewAPITokenDrawer';
import { basePerms } from './utils';

const nonParentPerms = basePerms.filter((value) => value !== 'child_account');

const token = appTokenFactory.build({ label: 'my-token', scopes: '*' });
const limitedToken = appTokenFactory.build({
  label: 'my-limited-token',
  scopes: '',
});

const props = {
  onClose: vi.fn(),
  open: true,
  token,
};

describe('View API Token Drawer', () => {
  it('the token label should be visible', () => {
    const { getByText } = renderWithTheme(<ViewAPITokenDrawer {...props} />);

    expect(getByText(token.label)).toBeVisible();
  });

  it('should show all permissions as none with no scopes', () => {
    const { getByTestId } = renderWithTheme(
      <ViewAPITokenDrawer {...props} token={limitedToken} />,
      { flags: { parentChildAccountAccess: false } }
    );
    for (const permissionName of nonParentPerms) {
      expect(getByTestId(`perm-${permissionName}`)).toHaveAttribute(
        'aria-label',
        `This token has 0 access for ${permissionName}`
      );
    }
  });

  it('should show all permissions as read/write with wildcard scopes', () => {
    const { getByTestId } = renderWithTheme(
      <ViewAPITokenDrawer {...props} />,
      {}
    );
    for (const permissionName of nonParentPerms) {
      expect(getByTestId(`perm-${permissionName}`)).toHaveAttribute(
        'aria-label',
        `This token has 2 access for ${permissionName}`
      );
    }
  });

  it('only account has read/write, all others are none', () => {
    const { getByTestId } = renderWithTheme(
      <ViewAPITokenDrawer
        {...props}
        token={appTokenFactory.build({ scopes: 'account:read_write' })}
      />
    );
    for (const permissionName of nonParentPerms) {
      // We only expect account to have read/write for this test
      const expectedScopeLevel = permissionName === 'account' ? 2 : 0;
      expect(getByTestId(`perm-${permissionName}`)).toHaveAttribute(
        'aria-label',
        `This token has ${expectedScopeLevel} access for ${permissionName}`
      );
    }
  });

  it('check table for more complex permissions', () => {
    const { getByTestId } = renderWithTheme(
      <ViewAPITokenDrawer
        {...props}
        token={appTokenFactory.build({
          scopes:
            'databases:read_only domains:read_write events:read_write firewall:read_write images:read_write ips:read_write linodes:read_only lke:read_only longview:read_write nodebalancers:read_write object_storage:read_only stackscripts:read_write volumes:read_only',
        })}
      />
    );

    const expectedScopeLevels = {
      account: 0,
      databases: 1,
      domains: 2,
      events: 2,
      firewall: 2,
      images: 2,
      ips: 2,
      linodes: 1,
      lke: 1,
      longview: 2,
      nodebalancers: 2,
      object_storage: 1,
      stackscripts: 2,
      volumes: 1,
    } as const;

    for (const permissionName of nonParentPerms) {
      const expectedScopeLevel = expectedScopeLevels[permissionName];
      expect(getByTestId(`perm-${permissionName}`)).toHaveAttribute(
        'aria-label',
        `This token has ${expectedScopeLevel} access for ${permissionName}`
      );
    }
  });

  it('shows the child account perm in the table for a parent user account', () => {
    // TODO: test child_account perm; use basePerms
  });
});
