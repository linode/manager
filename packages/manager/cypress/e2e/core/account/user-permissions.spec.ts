import { profileFactory } from '@src/factories';
import { accountUserFactory } from '@src/factories/accountUsers';
import { grantsFactory } from '@src/factories/grants';
import { userPermissionsGrants } from 'support/constants/user-permissions';
import {
  mockGetUser,
  mockGetUserGrants,
  mockGetUserGrantsUnrestrictedAccess,
  mockGetUsers,
  mockUpdateUser,
  mockUpdateUserGrants,
} from 'support/intercepts/account';
import { mockGetProfile } from 'support/intercepts/profile';
import { ui } from 'support/ui';
import { shuffleArray } from 'support/util/arrays';
import { randomLabel } from 'support/util/random';

import type { Grant, Grants } from '@linode/api-v4';

// Message shown when user has unrestricted account access.
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
 * Returns a copy of a Grants object with its entity-specific permissions set to a new value.
 *
 * @param grants - Grants that should be copied with new permissions applied.
 * @param newPermissions - New permissions to apply to Grants.
 *
 * @returns Clone of `grants` with new permissions applied.
 */
const updateGrantMockPermissions = (
  grants: Grants,
  newPermissions: 'read_only' | 'read_write' | null
) => {
  return {
    ...grants,
    database: grants.database.map((grant: Grant) => ({
      ...grant,
      permissions: newPermissions,
    })),
    domain: grants.domain.map((grant: Grant) => ({
      ...grant,
      permissions: newPermissions,
    })),
    firewall: grants.firewall.map((grant: Grant) => ({
      ...grant,
      permissions: newPermissions,
    })),
    image: grants.image.map((grant: Grant) => ({
      ...grant,
      permissions: newPermissions,
    })),
    linode: grants.linode.map((grant: Grant) => ({
      ...grant,
      permissions: newPermissions,
    })),
    longview: grants.longview.map((grant: Grant) => ({
      ...grant,
      permissions: newPermissions,
    })),
    nodebalancer: grants.nodebalancer.map((grant: Grant) => ({
      ...grant,
      permissions: newPermissions,
    })),
    stackscript: grants.stackscript.map((grant: Grant) => ({
      ...grant,
      permissions: newPermissions,
    })),
    volume: grants.volume.map((grant: Grant) => ({
      ...grant,
      permissions: newPermissions,
    })),
    vpc: grants.vpc.map((grant: Grant) => ({
      ...grant,
      permissions: newPermissions,
    })),
  };
};

/**
 * Returns an array of entity labels belonging to the given Grants object.
 *
 * @returns Array of entity labels.
 */
const entityLabelsFromGrants = (grants: Grants) => {
  return [
    ...grants.database,
    ...grants.domain,
    ...grants.firewall,
    ...grants.image,
    ...grants.linode,
    ...grants.longview,
    ...grants.nodebalancer,
    ...grants.stackscript,
    ...grants.volume,
    ...grants.vpc,
  ].map((grant: Grant) => grant.label);
};

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
      restricted: false,
      username: randomLabel(),
    });

    const mockUserUpdated = {
      ...mockUser,
      restricted: true,
    };

    const mockUserGrantsUpdated = grantsFactory.build();

    // Initially mock user with unrestricted account access.
    mockGetUsers([mockUser]).as('getUsers');
    mockGetUser(mockUser).as('getUser');
    mockGetUserGrantsUnrestrictedAccess(mockUser.username).as('getUserGrants');

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
    cy.get('[data-qa="toggle-full-account-access"]')
      .should('be.visible')
      .click();

    ui.toast.assertMessage('User permissions successfully saved.');

    // Smoke tests to confirm that "General Permissions" and "Specific Permissions"
    // sections are visible.
    cy.findByText('General Permissions').should('be.visible');
    cy.findByText(unrestrictedAccessMessage).should('not.exist');
    cy.get('[data-qa-global-section]')
      .should('be.visible')
      .within(() => {
        cy.contains(
          'Configure the specific rights and privileges this user has within the account.'
        ).should('be.visible');
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
    mockGetUserGrantsUnrestrictedAccess(mockUser.username);
    cy.get('[data-qa="toggle-full-account-access"]')
      .should('be.visible')
      .click();

    cy.findByText('General Permissions').should('be.visible');
    cy.findByText(unrestrictedAccessMessage).should('be.visible');
    cy.findByText('Billing Access').should('not.exist');
    cy.findByText('Specific Permissions').should('not.exist');
  });

  /*
   * - Confirms that global and specific user permissions can be updated using mock API data.
   * - Confirms that toast notification is shown when updating global and specific permissions.
   */
  it('can update global and specific permissions', () => {
    const mockUser = accountUserFactory.build({
      restricted: true,
      username: randomLabel(),
    });

    const mockUserGrants = { ...userPermissionsGrants };
    const grantEntities = entityLabelsFromGrants(mockUserGrants);

    // Mock grants after global permissions changes have been applied.
    const mockUserGrantsUpdatedGlobal: Grants = {
      ...mockUserGrants,
      global: {
        account_access: 'read_only',
        add_buckets: true,
        add_databases: true,
        add_domains: true,
        add_firewalls: true,
        add_images: true,
        add_kubernetes: true,
        add_linodes: true,
        add_longview: true,
        add_nodebalancers: true,
        add_stackscripts: true,
        add_volumes: true,
        add_vpcs: true,
        cancel_account: true,
        child_account_access: true,
        longview_subscription: true,
      },
    };

    // Mock grants after entity-specific permissions changes have been applied.
    const mockUserGrantsUpdatedSpecific = {
      ...mockUserGrantsUpdatedGlobal,
      ...updateGrantMockPermissions(mockUserGrantsUpdatedGlobal, 'read_write'),
    };

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
    ui.toast.assertMessage('General user permissions successfully saved.');

    // Update entity-specific user permissions.
    mockUpdateUserGrants(mockUser.username, mockUserGrantsUpdatedSpecific).as(
      'updateUserGrants'
    );
    cy.get('[data-qa-entity-section]')
      .should('be.visible')
      .within(() => {
        grantEntities.forEach((entityLabel: string) => {
          cy.findByText(entityLabel)
            .should('be.visible')
            .closest('tr')
            .within(() => {
              // Confirm that "None" radio button is selected.
              cy.get('[data-qa-permission="None"]')
                .should('have.attr', 'data-qa-radio', 'true')
                .should('be.visible');

              // Click "Read-Write" radio button, confirm selection changes.
              cy.get('[data-qa-permission="Read-Write"]')
                .should('have.attr', 'data-qa-radio', 'false')
                .should('be.visible')
                .click();

              cy.get('[data-qa-permission="Read-Write"]').should(
                'have.attr',
                'data-qa-radio',
                'true'
              );
            });
        });

        // Save changes and confirm that toast notification appears.
        ui.button
          .findByTitle('Save')
          .should('be.visible')
          .should('be.enabled')
          .click();

        cy.wait('@updateUserGrants');
      });

    ui.toast.assertMessage(
      'Entity-specific user permissions successfully saved.'
    );
  });

  /*
   * - Confirms that users can discard changes to their global permissions using "Reset" button.
   * - Confirms that users can discard changes to their entity-specific permissions using "Reset" button.
   */
  it('can reset user permissions changes', () => {
    const mockUser = accountUserFactory.build({
      restricted: true,
      username: randomLabel(),
    });

    const mockUserGrants = { ...userPermissionsGrants };
    const grantEntities = entityLabelsFromGrants(mockUserGrants);

    mockGetUser(mockUser);
    mockGetUserGrants(mockUser.username, mockUserGrants);
    cy.visitWithLogin(`/account/users/${mockUser.username}/permissions`);

    // Test reset in Global Permissions section.
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

    // Test reset in Specific Permissions section.
    cy.get('[data-qa-entity-section]')
      .should('be.visible')
      .within(() => {
        grantEntities.forEach((entityLabel: string) => {
          cy.findByText(entityLabel)
            .should('be.visible')
            .closest('tr')
            .within(() => {
              // Confirm that "None" radio button is selected.
              cy.get('[data-qa-permission="None"]')
                .should('have.attr', 'data-qa-radio', 'true')
                .should('be.visible');

              // Click "Read Only" radio button, confirm selection changes.
              cy.get('[data-qa-permission="Read Only"]')
                .should('have.attr', 'data-qa-radio', 'false')
                .should('be.visible')
                .click();

              cy.get('[data-qa-permission="Read Only"]').should(
                'have.attr',
                'data-qa-radio',
                'true'
              );
            });
        });

        // Reset changes and confirm that permissions revert to initial state.
        ui.button
          .findByTitle('Reset')
          .should('be.visible')
          .should('be.enabled')
          .click();

        grantEntities.forEach((entityLabel: string) => {
          cy.findByText(entityLabel)
            .should('be.visible')
            .closest('tr')
            .within(() => {
              // Confirm that "None" radio button is selected.
              cy.get('[data-qa-permission="None"]')
                .should('have.attr', 'data-qa-radio', 'true')
                .should('be.visible');
            });
        });
      });
  });

  /**
   * Confirm the User Permissions flow for a child account.
   * Confirm that child accounts default to "Read Only" Billing Access and have disabled "Read Write".
   */
  it('tests the user permissions for a child account', () => {
    const mockProfile = profileFactory.build({
      username: 'unrestricted-child-user',
    });

    const mockActiveUser = accountUserFactory.build({
      restricted: false,
      user_type: 'child',
      username: 'unrestricted-child-user',
    });

    const mockRestrictedUser = {
      ...mockActiveUser,
      restricted: true,
      username: 'restricted-child-user',
    };

    const mockUserGrants = grantsFactory.build({
      global: { account_access: 'read_write' },
    });

    mockGetUsers([mockActiveUser, mockRestrictedUser]).as('getUsers');
    mockGetUser(mockActiveUser);
    mockGetUserGrants(mockActiveUser.username, mockUserGrants);
    mockGetProfile(mockProfile);

    cy.visitWithLogin(
      `/account/users/${mockRestrictedUser.username}/permissions`
    );
    mockGetUser(mockRestrictedUser);
    mockGetUserGrants(mockRestrictedUser.username, mockUserGrants);

    cy.get('[data-qa-global-section]')
      .should('be.visible')
      .within(() => {
        // Confirm that 'Read-Write' Billing Access is disabled and 'Read Only' Billing Access is selected by default.
        cy.get(`[data-qa-select-card-heading="Read-Write"]`)
          .closest('[data-qa-selection-card]')
          .should('be.visible')
          .should('have.attr', 'disabled');
        assertBillingAccessSelected('Read Only');

        // Switch billing access to "None" and confirm that "Read Only" has been deselected.
        selectBillingAccess('None');
        cy.get(`[data-qa-select-card-heading="Read Only"]`)
          .closest('[data-qa-selection-card]')
          .should('be.visible')
          .should('have.attr', 'data-qa-selection-card-checked', 'false');

        ui.button
          .findByTitle('Save')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });
  });

  /**
   * Confirm the User Permissions flow for a child account viewing a proxy user.
   * Confirm that no "Profile" tab is present on the proxy user's User Permissions page.
   * Confirm that proxy accounts default to "Read Write" Billing Access and have disabled "Read Only" and "None" options.
   */
  it('tests the user permissions for a child account viewing a proxy user', () => {
    const mockChildProfile = profileFactory.build({
      user_type: 'child',
      username: 'proxy-user',
    });

    const mockChildUser = accountUserFactory.build({
      restricted: false,
      user_type: 'child',
    });

    const mockRestrictedProxyUser = accountUserFactory.build({
      restricted: true,
      user_type: 'proxy',
      username: 'restricted-proxy-user',
    });

    const mockUserGrants = grantsFactory.build({
      global: { account_access: 'read_write' },
    });

    mockGetUsers([mockRestrictedProxyUser]).as('getUsers');
    mockGetUser(mockChildUser);
    mockGetUserGrants(mockChildUser.username, mockUserGrants);
    mockGetProfile(mockChildProfile);
    mockGetUser(mockRestrictedProxyUser);
    mockGetUserGrants(mockRestrictedProxyUser.username, mockUserGrants);

    cy.visitWithLogin(
      `/account/users/${mockRestrictedProxyUser.username}/permissions`
    );

    cy.findByText('Parent User Permissions', { exact: false }).should(
      'be.visible'
    );

    // Confirm that no "Profile" tab is present on the proxy user's User Permissions page.
    cy.findByText('User Profile').should('not.exist');

    cy.get('[data-qa-global-section]')
      .should('be.visible')
      .within(() => {
        // Confirm that 'Read-Write' Billing Access is enabled
        cy.get(`[data-qa-select-card-heading="Read-Write"]`)
          .closest('[data-qa-selection-card]')
          .should('be.visible')
          .should('be.enabled');
        assertBillingAccessSelected('Read-Write');

        // Confirm that 'Read Only' and 'None' Billing Access are disabled
        cy.get(`[data-qa-select-card-heading="Read Only"]`)
          .closest('[data-qa-selection-card]')
          .should('be.visible')
          .should('have.attr', 'disabled');

        cy.get(`[data-qa-select-card-heading="None"]`)
          .closest('[data-qa-selection-card]')
          .should('be.visible')
          .should('have.attr', 'disabled');
      });
  });
});
