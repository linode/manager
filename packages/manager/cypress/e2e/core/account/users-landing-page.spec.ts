import { profileFactory } from '@linode/utilities';
import { accountUserFactory } from '@src/factories/accountUsers';
import { grantsFactory } from '@src/factories/grants';
import {
  mockAddUser,
  mockDeleteUser,
  mockGetUser,
  mockGetUserGrants,
  mockGetUserGrantsUnrestrictedAccess,
  mockGetUsers,
} from 'support/intercepts/account';
import {
  mockGetProfile,
  mockGetProfileGrants,
} from 'support/intercepts/profile';
import { ui } from 'support/ui';
import { randomLabel } from 'support/util/random';

import { PARENT_USER } from 'src/features/Account/constants';

import type { Profile } from '@linode/api-v4';

/**
 * Initialize test users before tests
 *
 * @param mockProfile - Account profile.
 * @param enableChildAccountAccess - Child account access switch.
 *
 * @returns User array.
 */
const initTestUsers = (profile: Profile, enableChildAccountAccess: boolean) => {
  const mockProfile = profile;

  const mockRestrictedParentWithoutChildAccountAccess = accountUserFactory.build(
    {
      restricted: true,
      user_type: 'parent',
      username: 'restricted-parent-user-without-child-account-access',
    }
  );

  const mockRestrictedParentWithChildAccountAccess = accountUserFactory.build({
    restricted: true,
    user_type: 'parent',
    username: 'restricted-parent-user-with-child-account-access',
  });

  const mockUsers = [
    mockRestrictedParentWithoutChildAccountAccess,
    mockRestrictedParentWithChildAccountAccess,
  ];

  const mockParentNoAccountAccessGrants = grantsFactory.build({
    global: { child_account_access: false },
  });

  const mockParentWithAccountAccessGrants = grantsFactory.build({
    global: { child_account_access: true },
  });

  const mockProfileGrants = grantsFactory.build({
    global: { child_account_access: enableChildAccountAccess },
  });

  // Initially mock user with unrestricted account access.
  mockGetUsers(mockUsers).as('getUsers');
  mockGetUser(mockRestrictedParentWithoutChildAccountAccess);
  mockGetUserGrants(
    mockRestrictedParentWithoutChildAccountAccess.username,
    mockParentNoAccountAccessGrants
  );
  mockGetUser(mockRestrictedParentWithChildAccountAccess);
  mockGetUserGrants(
    mockRestrictedParentWithChildAccountAccess.username,
    mockParentWithAccountAccessGrants
  );
  mockGetProfileGrants(mockProfileGrants);
  mockGetProfile(mockProfile);

  return mockUsers;
};

describe('Users landing page', () => {
  /*
   * Confirm the visibility and status of the "Child account access" column for the following users:
   *   - Unrestricted parent user (Enabled)
   *   - Restricted parent user with child_account_access grant set to false (Disabled)
   *   - Restricted parent user with child_account_access grant set to true (Enabled)
   * Confirm that a "Child account access" column is present in the users table for parent users, but not for other types (default, proxy, and child))
   * Confirm the column reflects the status of child account access for the corresponding users
   */
  it('shows "Child account access" column for unrestricted parent users and shows restricted parent users who have the correct grant status', () => {
    const mockProfile = profileFactory.build({
      restricted: false,
      user_type: 'parent',
      username: 'unrestricted-parent-user',
    });

    const mockUsers = initTestUsers(mockProfile, true);

    // Navigate to Users & Grants page.
    cy.visitWithLogin('/account/users');
    cy.wait('@getUsers');

    // Confirm that "Child account access" column is present
    cy.findByText('Child Account Access').should('be.visible');
    mockUsers.forEach((user) => {
      cy.get(`[data-qa-table-row="${user.username}"]`)
        .should('be.visible')
        .within(() => {
          if (
            user.username ===
            'restricted-parent-user-without-child-account-access'
          ) {
            // The status should be "Disabled" for the user without "child_account_access" grant
            cy.findByText('Disabled').should('be.visible');
          } else {
            // The status should be "Enabled" for the user without "child_account_access" grant
            cy.findByText('Enabled').should('be.visible');
          }
        });
    });
  });

  it('shows "Child account access" column for restricted parent users with child_account_access grant set to true', () => {
    const mockProfile = profileFactory.build({
      restricted: true,
      user_type: 'parent',
      username: 'restricted-parent-user',
    });

    initTestUsers(mockProfile, true);

    // Navigate to Users & Grants page.
    cy.visitWithLogin('/account/users');

    // Confirm that "Child account access" column is present
    cy.findByText('Child Account Access').should('be.visible');
  });

  it('hides "Child account access" column for restricted parent users with child_account_access grant set to false', () => {
    const mockProfile = profileFactory.build({
      restricted: true,
      user_type: 'parent',
      username: 'restricted-parent-user',
    });

    initTestUsers(mockProfile, false);

    // Navigate to Users & Grants page.
    cy.visitWithLogin('/account/users');

    // Confirm that "Child account access" column is not present
    cy.findByText('Child Account Access').should('not.exist');
  });

  it('hides "Child account access" column for default users', () => {
    const mockProfile = profileFactory.build({
      restricted: false,
      username: 'default-user',
    });

    initTestUsers(mockProfile, false);

    // Navigate to Users & Grants page.
    cy.visitWithLogin('/account/users');
    cy.wait('@getUsers');

    // Confirm that "Child account access" column is not present
    cy.findByText('Child Account Access').should('not.exist');
  });

  it('hides "Child account access" column for proxy users', () => {
    const mockProfile = profileFactory.build({
      restricted: false,
      user_type: 'proxy',
      username: 'proxy-user',
    });

    initTestUsers(mockProfile, false);

    // Navigate to Users & Grants page.
    cy.visitWithLogin('/account/users');
    cy.wait('@getUsers');

    // Confirm that "Child account access" column is not present
    cy.findByText('Child Account Access').should('not.exist');
  });

  it('hides "Child account access" column for child users', () => {
    const mockProfile = profileFactory.build({
      restricted: false,
      user_type: 'child',
      username: 'child-user',
    });

    initTestUsers(mockProfile, false);

    // Navigate to Users & Grants page.
    cy.visitWithLogin('/account/users');
    cy.wait('@getUsers');

    // Confirm that "Child account access" column is not present
    cy.findByText('Child Account Access').should('not.exist');
  });

  /*
   * Confirm that "Parent User Settings" section is not present for parent users
   */
  it('hides "Parent User Settings" section for parent users', () => {
    const mockProfile = profileFactory.build({
      restricted: false,
      user_type: 'parent',
      username: 'unrestricted-parent-user',
    });

    const mockUser = accountUserFactory.build({
      restricted: false,
      username: 'unrestricted-user',
    });

    // Initially mock user with unrestricted account access.
    mockGetUsers([mockUser]).as('getUsers');
    mockGetUser(mockUser);
    mockGetUserGrantsUnrestrictedAccess(mockUser.username).as('getUserGrants');
    mockGetProfile(mockProfile);

    // Navigate to Users & Grants page.
    cy.visitWithLogin('/account/users');
    cy.wait('@getUsers');

    // Confirm the "Parent User Settings" and "User Settings" sections are not present.
    cy.findByText(`${PARENT_USER} Settings`).should('not.exist');
    cy.findByText('User Settings').should('not.exist');
  });

  /**
   * Confirm the Users & Grants and User Permissions pages flow for a child account viewing a proxy user.
   * Confirm that "Parent User Settings" and "User Settings" sections are present on the Users & Grants page.
   * Confirm that proxy accounts are listed under "Parent User Settings".
   * Confirm that clicking the "Manage Access" button navigates to the proxy user's User Permissions page at /account/users/:user/permissions.
   */
  it('tests the users landing flow for a child account viewing a proxy user', () => {
    const mockChildProfile = profileFactory.build({
      user_type: 'child',
      username: 'child-user',
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

    // Navigate to Users & Grants page and confirm "Parent User Settings" and "User Settings" sections are visible.
    cy.visitWithLogin('/account/users');
    cy.wait('@getUsers');
    cy.findByText(`${PARENT_USER} Settings`).should('be.visible');
    cy.findByText('User Settings').should('be.visible');

    // Find mock restricted proxy user under "Parent User Settings", click its "Manage Access" button.
    cy.findByLabelText('List of Parent Users')
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
  });

  it('can add users with full access', () => {
    const mockUser = accountUserFactory.build({
      restricted: false,
      username: randomLabel(),
    });

    const username = randomLabel();
    const newUser = accountUserFactory.build({
      email: `${username}@test.com`,
      restricted: false,
      username,
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
        cy.findByText('Username').click();
        cy.focused().type(`${newUser.username}{enter}`);
        cy.findByText('Email').click();
        cy.focused().type(`${newUser.username}@test.com{enter}`);
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
        cy.findByText('Username').click();
        cy.focused().type(`${newUser.username}{enter}`);
        cy.findByText('Email').click();
        cy.focused().type(`${newUser.username}@test.com{enter}`);
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
        cy.findByText('Username').click();
        cy.focused().type(`${newUser.username}{enter}`);

        // an inline error message will be displayed when the email address is invalid
        cy.findByText('Email').click();
        cy.focused().type(`not_valid_email_address{enter}`);
        ui.buttonGroup
          .findButtonByTitle('Add User')
          .should('be.visible')
          .should('be.enabled')
          .click();
        cy.findByText('Must be a valid Email address.').should('be.visible');

        // type email address
        cy.get('[id="email"]').click();
        cy.focused().clear();
        cy.focused().type(`${newUser.username}@test.com{enter}`);

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
      restricted: false,
      username: randomLabel(),
    });

    const username = randomLabel();
    const newUser = accountUserFactory.build({
      email: `${username}@test.com`,
      restricted: true,
      username,
    });

    mockGetUsers([mockUser]).as('getUsers');
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
        cy.findByText('Username').click();
        cy.focused().type(`${newUser.username}{enter}`);
        cy.findByText('Email').click();
        cy.focused().type(`${newUser.username}@test.com{enter}`);
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

    mockGetUser(newUser).as('getUser');

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
        cy.findByText('Username').click();
        cy.focused().type(`${newUser.username}{enter}`);

        // an inline error message will be displayed when the email address is invalid
        cy.findByText('Email').click();
        cy.focused().type(`not_valid_email_address{enter}`);
        ui.buttonGroup
          .findButtonByTitle('Add User')
          .should('be.visible')
          .should('be.enabled')
          .click();
        cy.findByText('Must be a valid Email address.').should('be.visible');

        // type email address
        cy.get('[id="email"]').click();
        cy.focused().clear();
        cy.focused().type(`${newUser.username}@test.com{enter}`);

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

    cy.wait('@getUser');

    // redirects to the new user's "User Permissions" page
    cy.url().should('endWith', `/users/${newUser.username}/permissions`);
  });

  it('can delete users', () => {
    const mockUser = accountUserFactory.build({
      restricted: false,
      username: randomLabel(),
    });

    const username = randomLabel();
    const additionalUser = accountUserFactory.build({
      email: `${username}@test.com`,
      restricted: false,
      username,
    });

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
