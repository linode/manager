import * as React from 'react';

import { appTokenFactory } from 'src/factories';
import { accountUserFactory } from 'src/factories/accountUsers';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ViewAPITokenDrawer } from './ViewAPITokenDrawer';
import { basePerms } from './utils';

import type { UserType } from '@linode/api-v4';

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

// TODO: Parent/Child - add back after API code is in prod. Replace basePerms with nonParentPerms.
// const nonParentPerms = basePerms.filter((value) => value !== 'child_account');

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

const ariaLabel = 'aria-label';

describe('View API Token Drawer', () => {
  it('the token label should be visible', () => {
    const { getByText } = renderWithTheme(<ViewAPITokenDrawer {...props} />);

    expect(getByText(token.label)).toBeVisible();
  });

  it('should show all permissions as read/write with wildcard scopes', () => {
    // We want to show all perms for this test, even perms specific to Parent/Child accounts.
    queryMocks.useAccountUser.mockReturnValue({
      data: accountUserFactory.build({ user_type: 'parent' }),
    });

    const { getByTestId } = renderWithTheme(<ViewAPITokenDrawer {...props} />, {
      flags: { parentChildAccountAccess: true, vpc: true },
    });
    for (const permissionName of basePerms) {
      expect(getByTestId(`perm-${permissionName}`)).toHaveAttribute(
        ariaLabel,
        `This token has 2 access for ${permissionName}`
      );
    }
  });

  it('should show all permissions as none with no scopes', () => {
    // We want to show all perms for this test, even perms specific to Parent/Child accounts.
    queryMocks.useAccountUser.mockReturnValue({
      data: accountUserFactory.build({ user_type: 'parent' }),
    });

    const { getByTestId } = renderWithTheme(
      <ViewAPITokenDrawer {...props} token={limitedToken} />,
      { flags: { parentChildAccountAccess: true, vpc: true } }
    );
    for (const permissionName of basePerms) {
      expect(getByTestId(`perm-${permissionName}`)).toHaveAttribute(
        ariaLabel,
        `This token has 0 access for ${permissionName}`
      );
    }
  });

  it('only account has read/write, all others are none', () => {
    // We want to show all perms for this test, even perms specific to Parent/Child accounts.
    queryMocks.useAccountUser.mockReturnValue({
      data: accountUserFactory.build({ user_type: 'parent' }),
    });

    const { getByTestId } = renderWithTheme(
      <ViewAPITokenDrawer
        {...props}
        token={appTokenFactory.build({ scopes: 'account:read_write' })}
      />,
      { flags: { parentChildAccountAccess: true, vpc: true } }
    );
    for (const permissionName of basePerms) {
      // We only expect account to have read/write for this test
      const expectedScopeLevel = permissionName === 'account' ? 2 : 0;
      expect(getByTestId(`perm-${permissionName}`)).toHaveAttribute(
        ariaLabel,
        `This token has ${expectedScopeLevel} access for ${permissionName}`
      );
    }
  });

  it('check table for more complex permissions', () => {
    // We want to show all perms for this test, even perms specific to Parent/Child accounts.
    queryMocks.useAccountUser.mockReturnValue({
      data: accountUserFactory.build({ user_type: 'parent' }),
    });

    const { getByTestId } = renderWithTheme(
      <ViewAPITokenDrawer
        {...props}
        token={appTokenFactory.build({
          scopes:
            'databases:read_only domains:read_write child_account:read_write events:read_write firewall:read_write images:read_write ips:read_write linodes:read_only lke:read_only longview:read_write nodebalancers:read_write object_storage:read_only stackscripts:read_write volumes:read_only vpc:read_write',
        })}
      />,
      { flags: { parentChildAccountAccess: true, vpc: true } }
    );

    const expectedScopeLevels = {
      account: 0,
      child_account: 2,
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

    for (const permissionName of basePerms) {
      const expectedScopeLevel = expectedScopeLevels[permissionName];
      expect(getByTestId(`perm-${permissionName}`)).toHaveAttribute(
        ariaLabel,
        `This token has ${expectedScopeLevel} access for ${permissionName}`
      );
    }
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

  describe('Parent/Child: User Roles', () => {
    const setupAndRender = (
      userType: UserType | null,
      enableFeatureFlag = true
    ) => {
      queryMocks.useAccountUser.mockReturnValue({
        data: accountUserFactory.build({ user_type: userType }),
      });

      return renderWithTheme(<ViewAPITokenDrawer {...props} />, {
        flags: { parentChildAccountAccess: enableFeatureFlag },
      });
    };

    const testChildScopeNotDisplayed = (
      userType: UserType | null,
      enableFeatureFlag = true
    ) => {
      const { queryByText } = setupAndRender(userType, enableFeatureFlag);
      const childScope = queryByText('Child Account Access');
      expect(childScope).not.toBeInTheDocument();
    };

    it('should not display the Child Account Access when feature flag is disabled', () => {
      testChildScopeNotDisplayed('parent', false);
    });

    it('should not display the Child Account Access scope for a user account without a parent role', () => {
      testChildScopeNotDisplayed(null);
    });

    it('should not display the Child Account Access scope for "proxy" user role', () => {
      testChildScopeNotDisplayed('proxy');
    });

    it('should not display the Child Account Access scope for "child" user role', () => {
      testChildScopeNotDisplayed('child');
    });
  });
});
