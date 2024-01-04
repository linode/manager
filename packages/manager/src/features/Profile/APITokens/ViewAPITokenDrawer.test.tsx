import * as React from 'react';

import { appTokenFactory } from 'src/factories';
import { accountUserFactory } from 'src/factories/accountUsers';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ViewAPITokenDrawer } from './ViewAPITokenDrawer';
import { basePerms } from './utils';

// Mock the useAccountUser hooks to immediately return the expected data, circumventing the HTTP request and loading state.
const queryMocks = vi.hoisted(() => ({
  useAccountUser: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/accountUsers', async () => {
  const actual = await vi.importActual<any>('src/queries/accountUsers');
  return {
    ...actual,
    useAccountUser: queryMocks.useAccountUser,
  };
});

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

  it('should show all permissions as read/write with wildcard scopes', () => {
    const { getByTestId } = renderWithTheme(<ViewAPITokenDrawer {...props} />, {
      flags: { vpc: true },
    });
    for (const permissionName of nonParentPerms) {
      expect(getByTestId(`perm-${permissionName}`)).toHaveAttribute(
        'aria-label',
        `This token has 2 access for ${permissionName}`
      );
    }
  });

  it('should show all permissions as none with no scopes', () => {
    const { getByTestId } = renderWithTheme(
      <ViewAPITokenDrawer {...props} token={limitedToken} />,
      { flags: { parentChildAccountAccess: false, vpc: true } }
    );
    for (const permissionName of nonParentPerms) {
      expect(getByTestId(`perm-${permissionName}`)).toHaveAttribute(
        'aria-label',
        `This token has 0 access for ${permissionName}`
      );
    }
  });

  it('only account has read/write, all others are none', () => {
    const { getByTestId } = renderWithTheme(
      <ViewAPITokenDrawer
        {...props}
        token={appTokenFactory.build({ scopes: 'account:read_write' })}
      />,
      { flags: { vpc: true } }
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
            'databases:read_only domains:read_write events:read_write firewall:read_write images:read_write ips:read_write linodes:read_only lke:read_only longview:read_write nodebalancers:read_write object_storage:read_only stackscripts:read_write volumes:read_only vpc:read_write',
        })}
      />,
      { flags: { vpc: true } }
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
      vpc: 2,
    } as const;

    for (const permissionName of nonParentPerms) {
      const expectedScopeLevel = expectedScopeLevels[permissionName];
      expect(getByTestId(`perm-${permissionName}`)).toHaveAttribute(
        'aria-label',
        `This token has ${expectedScopeLevel} access for ${permissionName}`
      );
    }
  });

  it('should show Child Account Access scope with read/write perms for a parent user account with the parent/child feature flag on', () => {
    queryMocks.useAccountUser.mockReturnValue({
      data: accountUserFactory.build({ user_type: 'parent' }),
    });

    const { getByTestId, getByText } = renderWithTheme(
      <ViewAPITokenDrawer
        {...props}
        token={appTokenFactory.build({
          scopes: 'child_account:read_write',
        })}
      />,
      {
        flags: { parentChildAccountAccess: true },
      }
    );

    const childScope = getByText('Child Account Access');
    const expectedScopeLevels = {
      child_account: 2,
    } as const;
    const childPermissionName = 'child_account';

    expect(childScope).toBeInTheDocument();
    expect(getByTestId(`perm-${childPermissionName}`)).toHaveAttribute(
      'aria-label',
      `This token has ${expectedScopeLevels[childPermissionName]} access for ${childPermissionName}`
    );
  });

  it('should not show the Child Account Access scope for a non-parent user account with the parent/child feature flag on', () => {
    queryMocks.useAccountUser.mockReturnValue({
      data: accountUserFactory.build({ user_type: null }),
    });

    const { queryByText } = renderWithTheme(<ViewAPITokenDrawer {...props} />, {
      flags: { parentChildAccountAccess: true },
    });

    const childScope = queryByText('Child Account Access');
    expect(childScope).not.toBeInTheDocument();
  });

  it('Should show the VPC scope with the VPC feature flag on', () => {
    const { getByText } = renderWithTheme(<ViewAPITokenDrawer {...props} />, {
      flags: { vpc: true },
    });
    const vpcScope = getByText('VPCs');
    expect(vpcScope).toBeInTheDocument();
  });

  it('Should not show the VPC scope with the VPC feature flag off', () => {
    const { queryByText } = renderWithTheme(<ViewAPITokenDrawer {...props} />, {
      flags: { vpc: false },
    });

    const vpcScope = queryByText('VPCs');
    expect(vpcScope).not.toBeInTheDocument();
  });
});
