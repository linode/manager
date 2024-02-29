import { profileFactory } from '@src/factories';
import { accountUserFactory } from '@src/factories/accountUsers';
import { grantsFactory } from '@src/factories/grants';
import {
  mockAddUser,
  mockGetUser,
  mockGetUserGrants,
  mockGetUserGrantsUnrestrictedAccess,
  mockGetUsers,
  mockDeleteUser,
} from 'support/intercepts/account';
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { mockGetProfile } from 'support/intercepts/profile';
import { ui } from 'support/ui';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import { randomLabel } from 'support/util/random';

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

describe('Users landing page', () => {
  /*
   * Confirm that a "Child account access" column is present in the users table
   * Confirm the column reflects the status of child account access for the corresponding users
   */
  it('shows "Child account access" column for all users', () => {
    const mockProfile = profileFactory.build({
      username: 'unrestricted-parent-user',
      restricted: false,
      user_type: 'parent',
    });

    const mockUser = accountUserFactory.build({
      username: 'unrestricted-user',
      restricted: false,
    });

    const mockRestrictedUser = accountUserFactory.build({
      username: 'restricted-user',
      restricted: false,
    });

    const mockChildUser = accountUserFactory.build({
      username: 'child-user',
      restricted: false,
      user_type: 'child',
    });

    const mockProxyUser = accountUserFactory.build({
      username: 'proxy-user',
      restricted: false,
      user_type: 'proxy',
    });

    const mockUsers = [
      mockUser,
      mockRestrictedUser,
      mockChildUser,
      mockProxyUser,
    ];

    const mockUserGrants = grantsFactory.build({
      global: { child_account_access: true },
    });

    // TODO: Parent/Child - M3-7559 clean up when feature is live in prod and feature flag is removed.
    mockAppendFeatureFlags({
      parentChildAccountAccess: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');

    // Initially mock user with unrestricted account access.
    mockGetUsers(mockUsers).as('getUsers');
    mockUsers.forEach((user) => {
      mockGetUser(user);
      mockGetUserGrantsUnrestrictedAccess(user.username);
    });
    mockGetUserGrants(mockUser.username, mockUserGrants);
    mockGetProfile(mockProfile);

    // Navigate to Users & Grants page.
    cy.visitWithLogin('/account/users');
    cy.wait('@getUsers');

    // Confirm that "Child account access" column is present
    cy.findByText('Child Account Access').should('be.visible');
    mockUsers.forEach((user) => {
      cy.get(`[aria-label="User ${user.username}"]`)
        .should('be.visible')
        .within(() => {
          if (user === mockUser) {
            // The status should be "Enabled" when the user with "child_account_access" grant
            cy.findByText('Enabled').should('be.visible');
          } else {
            // Others should be "Disabled"
            cy.findByText('Disabled').should('be.visible');
          }
        });
    });
  });

  /*
   * Confirm that "Business Partner Settings" section is not present for parent users
   */
  it('hides "Business Partner Settings" section for parent users', () => {
    const mockProfile = profileFactory.build({
      username: 'unrestricted-parent-user',
      restricted: false,
      user_type: 'parent',
    });

    const mockUser = accountUserFactory.build({
      username: 'unrestricted-user',
      restricted: false,
    });

    // TODO: Parent/Child - M3-7559 clean up when feature is live in prod and feature flag is removed.
    mockAppendFeatureFlags({
      parentChildAccountAccess: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');

    // Initially mock user with unrestricted account access.
    mockGetUsers([mockUser]).as('getUsers');
    mockGetUser(mockUser).as('getUser');
    mockGetUserGrantsUnrestrictedAccess(mockUser.username).as('getUserGrants');
    mockGetProfile(mockProfile);

    // Navigate to Users & Grants page.
    cy.visitWithLogin('/account/users');
    cy.wait('@getUsers');

    // Confirm the "Business partner setting" and "User settings" sections are not present.
    cy.findByText('Business partner settings').should('not.exist');
    cy.findByText('User settings').should('not.exist');
  });

  /**
   * Confirm the Users & Grants and User Permissions pages flow for a child account viewing a proxy user.
   * Confirm that "Business partner settings" and "User settings" sections are present on the Users & Grants page.
   * Confirm that proxy accounts are listed under "Business partner settings".
   * Confirm that clicking the "Manage Access" button navigates to the proxy user's User Permissions page at /account/users/:user/permissions.
   * Confirm that no "Profile" tab is present on the proxy user's User Permissions page.
   * Confirm that proxy accounts default to "Read Write" Billing Access and have disabled "Read Only" and "None" options.
   */
  it('tests the users landing and user permissions flow for a child account viewing a proxy user', () => {
    const mockChildProfile = profileFactory.build({
      username: 'proxy-user',
      user_type: 'child',
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

    // TODO: Parent/Child - M3-7559 clean up when feature is live in prod and feature flag is removed.
    mockAppendFeatureFlags({
      parentChildAccountAccess: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');

    mockGetUsers([mockRestrictedProxyUser]).as('getUsers');
    mockGetUser(mockChildUser);
    mockGetUserGrants(mockChildUser.username, mockUserGrants);
    mockGetProfile(mockChildProfile);
    mockGetUser(mockRestrictedProxyUser);
    mockGetUserGrants(mockRestrictedProxyUser.username, mockUserGrants);

    // Navigate to Users & Grants page and confirm "Business partner settings" and "User settings" sections are visible.
    cy.visitWithLogin('/account/users');
    cy.wait('@getUsers');
    cy.findByText('Business partner settings').should('be.visible');
    cy.findByText('User settings').should('be.visible');

    // Find mock restricted proxy user under "Business partner settings", click its "Manage Access" button.
    cy.findByLabelText('List of Business Partners')
      .should('be.visible')
      .within(() => {
        cy.findByText(mockRestrictedProxyUser.username)
          .should('be.visible')
          .closest('tr')
          .within(() => {
            ui.button
              .findByTitle('Manage Access')
              .should('be.visible')
              .should('be.enabled')
              .click();
          });
      });

    // Confirm button navigates to the proxy user's User Permissions page at /account/users/:user/permissions.
    cy.url().should(
      'endWith',
      `/account/users/${mockRestrictedProxyUser.username}/permissions`
    );
    cy.wait(['@getClientStream', '@getFeatureFlags']);

    cy.findByText('Business Partner Permissions').should('be.visible');

    // Confirm that no "Profile" tab is present on the proxy user's User Permissions page.
    expect(cy.findByText('User Profile').should('not.exist'));

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

  it('can add users with full access', () => {
    const mockUser = accountUserFactory.build({
      username: randomLabel(),
      restricted: false,
    });

    const username = randomLabel();
    const newUser = accountUserFactory.build({
      username: username,
      email: `${username}@test.com`,
      restricted: false,
    });

    mockGetUsers([mockUser]).as('getUsers');
    mockGetUser(mockUser);
    mockGetUserGrantsUnrestrictedAccess(mockUser.username);
    mockAddUser(newUser).as('addUser');

    // Navigate to Users & Grants page, find mock user, click its "User Permissions" button.
    cy.visitWithLogin('/account/users');
    cy.wait('@getUsers');

    // Confirm that the "Users & Grants" page initially lists the main user
    cy.findByText(mockUser.username).should('be.visible');

    mockGetUsers([mockUser, newUser]).as('getUsers');

    // "Add a User" button shows up and is clickable
    cy.findByText('Add a User')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // "Add a User" drawer shows up
    ui.drawer
      .findByTitle('Add a User')
      .should('be.visible')
      .within(() => {
        cy.findByText('Username').click().type(`${newUser.username}{enter}`);
        cy.findByText('Email')
          .click()
          .type(`${newUser.username}@test.com{enter}`);
        ui.buttonGroup
          .findButtonByTitle('Cancel')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });
    // the drawer has been closed
    cy.findByText('Add a User').should('not.exist');
    // cancel button will not add a new user
    cy.findByText(newUser.username).should('not.exist');

    cy.findByText('Add a User')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // "x" button will not add a new user
    ui.drawer
      .findByTitle('Add a User')
      .should('be.visible')
      .within(() => {
        cy.findByText('Username').click().type(`${newUser.username}{enter}`);
        cy.findByText('Email')
          .click()
          .type(`${newUser.username}@test.com{enter}`);
        ui.buttonGroup
          .findButtonByTitle('Cancel')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });
    // the drawer has been closed
    cy.findByText('Add a User').should('not.exist');
    // no new user is added
    cy.findByText(newUser.username).should('not.exist');

    // new user should be added and shown in the user list
    cy.findByText('Add a User')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // confirm to add a new user
    ui.drawer
      .findByTitle('Add a User')
      .should('be.visible')
      .within(() => {
        // an inline error message will be displayed when username or email is not specified
        ui.buttonGroup
          .findButtonByTitle('Add User')
          .should('be.visible')
          .should('be.enabled')
          .click();
        cy.findByText('Username is required.').should('be.visible');
        cy.findByText('Email address is required.').should('be.visible');

        // type username
        cy.findByText('Username').click().type(`${newUser.username}{enter}`);

        // an inline error message will be displayed when the email address is invalid
        cy.findByText('Email').click().type(`not_valid_email_address{enter}`);
        ui.buttonGroup
          .findButtonByTitle('Add User')
          .should('be.visible')
          .should('be.enabled')
          .click();
        cy.findByText('Must be a valid Email address.').should('be.visible');

        // type email address
        cy.get('[id="email"]')
          .click()
          .clear()
          .type(`${newUser.username}@test.com{enter}`);

        ui.buttonGroup
          .findButtonByTitle('Add User')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });
    // Cloud Manager passes "restricted: false" in the request payload
    cy.wait('@addUser').then((intercept) => {
      expect(intercept.request.body['restricted']).to.equal(newUser.restricted);
    });
    cy.wait('@getUsers');

    // the new user is displayed in the user list
    cy.findByText(newUser.username).should('be.visible');

    // no redirect occurs
    cy.url().should('endWith', '/users');
  });

  it('can add users with restricted access', () => {
    const mockUser = accountUserFactory.build({
      username: randomLabel(),
      restricted: false,
    });

    const username = randomLabel();
    const newUser = accountUserFactory.build({
      username: username,
      email: `${username}@test.com`,
      restricted: true,
    });

    // TODO: Parent/Child - M3-7559 clean up when feature is live in prod and feature flag is removed.
    mockAppendFeatureFlags({
      parentChildAccountAccess: makeFeatureFlagData(false),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');

    mockGetUsers([mockUser]).as('getUsers');
    mockGetUser(mockUser);
    mockGetUserGrantsUnrestrictedAccess(mockUser.username);
    mockAddUser(newUser).as('addUser');

    // Navigate to Users & Grants page, find mock user, click its "User Permissions" button.
    cy.visitWithLogin('/account/users');
    cy.wait('@getUsers');

    // Confirm that the "Users & Grants" page initially lists the main user
    cy.findByText(mockUser.username).should('be.visible');

    mockGetUsers([mockUser, newUser]).as('getUsers');

    // "Add a User" button shows up and is clickable
    cy.findByText('Add a User')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // "Add a User" drawer shows up
    ui.drawer
      .findByTitle('Add a User')
      .should('be.visible')
      .within(() => {
        cy.findByText('Username').click().type(`${newUser.username}{enter}`);
        cy.findByText('Email')
          .click()
          .type(`${newUser.username}@test.com{enter}`);
        ui.buttonGroup
          .findButtonByTitle('Cancel')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // "x" or cancel button will not add a new user
    cy.findByText(newUser.username).should('not.exist');

    // new user should be added and shown in the user list
    cy.findByText('Add a User')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // confirm to add a new user
    ui.drawer
      .findByTitle('Add a User')
      .should('be.visible')
      .within(() => {
        // an inline error message will be displayed when username or email is not specified
        ui.buttonGroup
          .findButtonByTitle('Add User')
          .should('be.visible')
          .should('be.enabled')
          .click();
        cy.findByText('Username is required.').should('be.visible');
        cy.findByText('Email address is required.').should('be.visible');

        // type username
        cy.findByText('Username').click().type(`${newUser.username}{enter}`);

        // an inline error message will be displayed when the email address is invalid
        cy.findByText('Email').click().type(`not_valid_email_address{enter}`);
        ui.buttonGroup
          .findButtonByTitle('Add User')
          .should('be.visible')
          .should('be.enabled')
          .click();
        cy.findByText('Must be a valid Email address.').should('be.visible');

        // type email address
        cy.get('[id="email"]')
          .click()
          .clear()
          .type(`${newUser.username}@test.com{enter}`);

        // toggle to disable full access
        cy.get('[data-qa-create-restricted="true"]')
          .should('be.visible')
          .click();

        ui.buttonGroup
          .findButtonByTitle('Add User')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });
    // Cloud Manager passes "restricted: true" in the request payload
    cy.wait('@addUser').then((intercept) => {
      expect(intercept.request.body['restricted']).to.equal(newUser.restricted);
    });
    cy.wait('@getUsers');
    cy.wait(['@getClientStream', '@getFeatureFlags']);

    // the new user is displayed in the user list
    cy.findByText(newUser.username).should('be.visible');

    // redirects to the new user's "User Permissions" page
    cy.url().should('endWith', `/users/${newUser.username}/permissions`);
  });

  it('can delete users', () => {
    const mockUser = accountUserFactory.build({
      username: randomLabel(),
      restricted: false,
    });

    const username = randomLabel();
    const additionalUser = accountUserFactory.build({
      username: username,
      email: `${username}@test.com`,
      restricted: false,
    });

    // TODO: Parent/Child - M3-7559 clean up when feature is live in prod and feature flag is removed.
    mockAppendFeatureFlags({
      parentChildAccountAccess: makeFeatureFlagData(false),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');

    mockGetUsers([mockUser, additionalUser]).as('getUsers');
    mockGetUser(mockUser);
    mockGetUserGrantsUnrestrictedAccess(mockUser.username);
    mockGetUserGrantsUnrestrictedAccess(additionalUser.username);
    mockDeleteUser(additionalUser.username).as('deleteUser');

    // Navigate to Users & Grants page, find mock user, click its "User Permissions" button.
    cy.visitWithLogin('/account/users');
    cy.wait('@getUsers');

    mockGetUsers([mockUser]).as('getUsers');

    // Confirm that the "Users & Grants" page initially lists the main and additional users
    cy.findByText(mockUser.username).should('be.visible');
    cy.findByText(additionalUser.username)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        ui.button
          .findByTitle('Delete')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // the "Confirm Deletion" dialog opens
    ui.dialog.findByTitle('Confirm Deletion').within(() => {
      ui.button.findByTitle('Cancel').should('be.visible').click();
    });
    // click the "Cancel" button will do nothing
    cy.findByText(mockUser.username).should('be.visible');
    cy.findByText(additionalUser.username).should('be.visible');

    // clicking the "x" button will dismiss the dialog and do nothing
    cy.findByText(additionalUser.username)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        ui.button
          .findByTitle('Delete')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });
    ui.dialog.findByTitle('Confirm Deletion').within(() => {
      cy.get('[data-testid="CloseIcon"]').should('be.visible').click();
    });
    cy.findByText(mockUser.username).should('be.visible');
    cy.findByText(additionalUser.username).should('be.visible');

    // delete the user
    cy.findByText(additionalUser.username)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        ui.button
          .findByTitle('Delete')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // the "Confirm Deletion" dialog opens
    ui.dialog.findByTitle('Confirm Deletion').within(() => {
      ui.button.findByTitle('Delete').should('be.visible').click();
    });
    cy.wait(['@deleteUser', '@getUsers']);

    // the user is deleted
    ui.toast.assertMessage(
      `User ${additionalUser.username} has been deleted successfully.`
    );
    cy.findByText(additionalUser.username).should('not.exist');
  });
});
