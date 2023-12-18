import {
  mockGetUser,
  mockUpdateUser,
  mockGetUserGrants,
  mockUpdateUserGrants,
  mockGetUsers,
} from 'support/intercepts/account';
import { accountUserFactory } from '@src/factories/accountUsers';
import { grantsFactory, grantFactory } from '@src/factories/grants';
import { randomLabel } from 'support/util/random';
import { shuffleArray } from 'support/util/arrays';
import { ui } from 'support/ui';

// Message shown when user has unrestricted account acess.
const unrestrictedAccessMessage =
  'This user has unrestricted access to the account.';

// Toggle button labels for Global Permissions section.
const globalPermissionsLabels = [
  'Can add Linodes to this account ($)',
  'Can add Longview clients to this account',
  'Can add Domains using the DNS Manager',
  'Can create frozen Images under this account ($)',
  'Can add Firewalls to this account',
  'Can add VPCs to this account',
  'Can add NodeBalancers to this account ($)',
  'Can modify this account’s Longview subscription ($)',
  'Can create StackScripts under this account',
  'Can add Block Storage Volumes to this account ($)',
  'Can add Databases to this account ($)',
];

// Specific permission entity types.
const specificPermissionsTypes = [
  'Linodes',
  'Firewalls',
  'StackScripts',
  'Images',
  'Volumes',
  'NodeBalancers',
  'Domains',
  'Longview Clients',
  'Databases',
  'VPCs',
];

/**
 * Assert whether all global permissions are enabled or disabled.
 *
 * @param enabled - When `true`, assert that all permissions are enabled. Otherwise, assert they are disabled.
 */
const assertAllGlobalPermissions = (enabled: boolean) => {
  globalPermissionsLabels.forEach((permissionLabel: string) => {
    const checkedQuery = enabled ? 'be.checked' : 'not.be.checked';
    cy.findByLabelText(permissionLabel).should(checkedQuery);
  });
};

/**
 * Selects "None", "Read Only", or "Read-Write" billing access.
 *
 * @param billingAccess - Billing access to select.
 */
const selectBillingAccess = (
  billingAccess: 'None' | 'Read Only' | 'Read-Write'
) => {
  cy.get(`[data-qa-select-card-heading="${billingAccess}"]`)
    .closest('[data-qa-selection-card]')
    .should('be.visible')
    .click();
};

/**
 * Asserts whether "None", "Read Only", or "Read-Write" billing access is selected.
 *
 * @param billingAccess - Selected billing access to assert.
 */
const assertBillingAccessSelected = (
  billingAccess: 'None' | 'Read Only' | 'Read-Write'
) => {
  cy.get(`[data-qa-select-card-heading="${billingAccess}"]`)
    .closest('[data-qa-selection-card]')
    .should('be.visible')
    .should('have.attr', 'data-qa-selection-card-checked', 'true');
};

describe('User permission management', () => {
  /*
   * - Confirms that full account access can be toggled for account users using mock API data.
   * - Confirms that users can navigate to User Permissions pages via Users & Grants page.
   * - Confirms that User Permissions page updates to reflect enabled full account access.
   * - Confirms that User Permissions page updates to reflect disabled full account access.
   */
  it('can toggle full account access', () => {
    const mockUser = accountUserFactory.build({
      username: randomLabel(),
      restricted: false,
    });

    const mockUserUpdated = {
      ...mockUser,
      restricted: true,
    };

    const mockUserGrantsUpdated = grantsFactory.build();
    const mockUserGrants = {
      ...mockUserGrantsUpdated,
      global: undefined,
    };

    mockGetUsers([mockUser]).as('getUsers');
    mockGetUser(mockUser).as('getUser');
    mockGetUserGrants(mockUser.username, mockUserGrants).as('getUserGrants');

    // Navigate to Users & Grants page, find mock user, click its "User Permissions" button.
    cy.visitWithLogin('/account/users');
    cy.wait('@getUsers');
    cy.findByText(mockUser.username)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        ui.button
          .findByTitle('User Permissions')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm that Cloud navigates to the user's permissions page and that user has
    // unrestricted account access.
    cy.url().should(
      'endWith',
      `/account/users/${mockUser.username}/permissions`
    );
    cy.findByText(unrestrictedAccessMessage).should('be.visible');

    // Restrict account access, confirm page updates to reflect change.
    mockUpdateUser(mockUser.username, mockUserUpdated);
    mockGetUserGrants(mockUser.username, mockUserGrantsUpdated);
    cy.findByLabelText('Toggle Full Account Access')
      .should('be.visible')
      .click();

    // Smoke tests to confirm that "Global Permissions" and "Specific Permissions"
    // sections are visible.
    cy.findByText(unrestrictedAccessMessage).should('not.exist');
    cy.get('[data-qa-global-section]')
      .should('be.visible')
      .within(() => {
        cy.findByText('Global Permissions').should('be.visible');
        cy.findByText('Billing Access').should('be.visible');
        globalPermissionsLabels.forEach((permissionLabel: string) => {
          cy.findByText(permissionLabel).should('be.visible');
        });
      });

    cy.get('[data-qa-entity-section]')
      .should('be.visible')
      .within(() => {
        cy.findByText('Specific Permissions').should('be.visible');
        specificPermissionsTypes.forEach((permissionLabel: string) => {
          cy.findByText(permissionLabel).should('be.visible');
        });
      });

    // Re-enable unrestricted account access, confirm page updates to reflect change.
    mockUpdateUser(mockUser.username, mockUser);
    mockGetUserGrants(mockUser.username, mockUserGrants);
    cy.findByLabelText('Toggle Full Account Access')
      .should('be.visible')
      .click();

    cy.findByText(unrestrictedAccessMessage).should('be.visible');
    cy.findByText('Global Permissions').should('not.exist');
    cy.findByText('Billing Access').should('not.exist');
    cy.findByText('Specific Permissions').should('not.exist');
  });

  /*
   * - Confirms that global and specific user permissions can be updated using mock API data.
   * - Confirms that toast notification is shown when updating global and specific permissions.
   */
  it.only('can update global and specific permissions', () => {
    const mockUser = accountUserFactory.build({
      username: randomLabel(),
      restricted: true,
    });

    const initialGrants = {
      database: grantFactory.buildList(1, {
        label: randomLabel(),
        permissions: null,
      }),
      domain: grantFactory.buildList(1, {
        label: randomLabel(),
        permissions: null,
      }),
      firewall: grantFactory.buildList(1, {
        label: randomLabel(),
        permissions: null,
      }),
      image: grantFactory.buildList(1, {
        label: randomLabel(),
        permissions: null,
      }),
      linode: grantFactory.buildList(1, {
        label: randomLabel(),
        permissions: null,
      }),
      longview: grantFactory.buildList(1, {
        label: randomLabel(),
        permissions: null,
      }),
      nodebalancer: grantFactory.buildList(1, {
        label: randomLabel(),
        permissions: null,
      }),
      stackscript: grantFactory.buildList(1, {
        label: randomLabel(),
        permissions: null,
      }),
      volume: grantFactory.buildList(1, {
        label: randomLabel(),
        permissions: null,
      }),
      vpc: grantFactory.buildList(1, {
        label: randomLabel(),
        permissions: null,
      }),
    };

    const updatedGrants = {
      database: initialGrants.database.map((grant) => ({
        ...grant,
        permissions: 'read_write',
      })),
      domain: initialGrants.domain.map((grant) => ({
        ...grant,
        permissions: 'read_write',
      })),
      firewall: initialGrants.firewall.map((grant) => ({
        ...grant,
        permissions: 'read_write',
      })),
      image: initialGrants.image.map((grant) => ({
        ...grant,
        permissions: 'read_write',
      })),
      linode: initialGrants.linode.map((grant) => ({
        ...grant,
        permissions: 'read_write',
      })),
      longview: initialGrants.longview.map((grant) => ({
        ...grant,
        permissions: 'read_write',
      })),
      nodebalancer: initialGrants.nodebalancer.map((grant) => ({
        ...grant,
        permissions: 'read_write',
      })),
      stackscript: initialGrants.stackscript.map((grant) => ({
        ...grant,
        permissions: 'read_write',
      })),
      volume: initialGrants.volume.map((grant) => ({
        ...grant,
        permissions: 'read_write',
      })),
      vpc: initialGrants.vpc.map((grant) => ({
        ...grant,
        permissions: 'read_write',
      })),
    };

    const mockUserGrants = grantsFactory.build({
      global: {
        account_access: null,
        add_domains: false,
        add_firewalls: false,
        add_images: false,
        add_linodes: false,
        add_longview: false,
        add_nodebalancers: false,
        add_stackscripts: false,
        add_volumes: false,
        add_vpcs: false,
        longview_subscription: false,
      },
      ...initialGrants,
    });

    const mockUserGrantsUpdatedGlobal = {
      ...mockUserGrants,
      global: {
        account_access: 'read_only',
        add_domains: true,
        add_firewalls: true,
        add_images: true,
        add_linodes: true,
        add_longview: true,
        add_nodebalancers: true,
        add_stackscripts: true,
        add_volumes: true,
        add_vpcs: true,
        longview_subscription: true,
      },
    };

    const mockUserGrantsUpdatedSpecific = {
      ...mockUserGrantsUpdatedGlobal,
      ...updatedGrants,
    };

    console.log(mockUserGrants);

    mockGetUser(mockUser).as('getUser');
    mockGetUserGrants(mockUser.username, mockUserGrants).as('getUserGrants');
    cy.visitWithLogin(`/account/users/${mockUser.username}/permissions`);
    cy.wait(['@getUser', '@getUserGrants']);

    mockUpdateUserGrants(mockUser.username, mockUserGrantsUpdatedGlobal).as(
      'updateUserGrants'
    );
    cy.get('[data-qa-global-section]')
      .should('be.visible')
      .within(() => {
        // Confirm that all global permissions are disabled, and then enable some.
        assertAllGlobalPermissions(false);
        assertBillingAccessSelected('None');

        // Enable all global permissions and "Read-Only" billing access.
        globalPermissionsLabels.forEach((permissionLabel: string) => {
          cy.findByText(permissionLabel).should('be.visible').click();
        });
        selectBillingAccess('Read Only');

        ui.button
          .findByTitle('Save')
          .should('be.visible')
          .should('be.enabled')
          .click();

        cy.wait('@updateUserGrants');
      });

    // Confirm that toast notification appears when updating global permissions.
    ui.toast.assertMessage('Successfully saved global permissions');

    cy.get('[data-qa-entity-section]')
      .should('be.visible')
      .within(() => {});
  });

  /*
   * - Confirms that global and specific permissions can be reset to their initial state.
   */
  it('can reset user permissions changes', () => {
    const mockUser = accountUserFactory.build({
      username: randomLabel(),
      restricted: true,
    });

    const mockUserGrants = grantsFactory.build({
      global: {
        account_access: null,
        add_domains: false,
        add_firewalls: false,
        add_images: false,
        add_linodes: false,
        add_longview: false,
        add_nodebalancers: false,
        add_stackscripts: false,
        add_volumes: false,
        add_vpcs: false,
        longview_subscription: false,
      },
    });

    mockGetUser(mockUser);
    mockGetUserGrants(mockUser.username, mockUserGrants);
    cy.visitWithLogin(`/account/users/${mockUser.username}/permissions`);
    cy.get('[data-qa-global-section]')
      .should('be.visible')
      .within(() => {
        // Confirm that all global permissions are disabled and that the user
        // does not have billing access.
        assertAllGlobalPermissions(false);
        assertBillingAccessSelected('None');

        // Enable random permissions and billing read-write access.
        shuffleArray(globalPermissionsLabels)
          .slice(0, 5)
          .forEach((permissionLabel: string) => {
            cy.findByText(permissionLabel).should('be.visible').click();
          });

        selectBillingAccess('Read-Write');

        // Click "Reset" button and confirm that global permissions revert to
        // their initial state.
        ui.button
          .findByTitle('Reset')
          .should('be.visible')
          .should('be.enabled')
          .click();

        assertAllGlobalPermissions(false);
        assertBillingAccessSelected('None');
      });
  });
});
