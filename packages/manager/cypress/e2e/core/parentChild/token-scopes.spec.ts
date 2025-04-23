import { profileFactory } from '@linode/utilities';
import { accountFactory, appTokenFactory } from '@src/factories';
import { accountUserFactory } from '@src/factories/accountUsers';
import { DateTime } from 'luxon';
import {
  mockGetAccount,
  mockGetChildAccounts,
  mockGetUser,
} from 'support/intercepts/account';
import {
  mockCreatePersonalAccessToken,
  mockGetAppTokens,
  mockGetPersonalAccessTokens,
  mockGetProfile,
} from 'support/intercepts/profile';
import { ui } from 'support/ui';
import { randomLabel, randomNumber, randomString } from 'support/util/random';

const mockParentAccount = accountFactory.build({
  company: 'Parent Company',
});

const mockParentProfile = profileFactory.build({
  user_type: 'parent',
  username: randomLabel(),
});

const mockParentUser = accountUserFactory.build({
  user_type: 'parent',
  username: mockParentProfile.username,
});

const mockChildAccount = accountFactory.build({
  company: 'Partner Company',
});

const mockParentAccountToken = appTokenFactory.build({
  created: DateTime.now().toISO(),
  expiry: DateTime.now().plus({ minutes: 15 }).toISO(),
  id: randomNumber(),
  label: `${mockParentAccount.company}_proxy`,
  scopes: '*',
  thumbnail_url: undefined,
  token: randomString(32),
  website: undefined,
});

describe('Token scopes', () => {
  /*
   * Confirm that the “Child account access” grant is not visible in the list of permissions.
   * Upon clicking “Create Token”, assert that the outgoing API request payload contains "scopes" value as defined in token.
   */
  it('Token scopes for parent user with restricted access', () => {
    mockGetProfile(mockParentProfile);
    mockGetAccount(mockParentAccount);
    mockGetChildAccounts([mockChildAccount]);
    mockGetProfile({ ...mockParentProfile, restricted: true });
    mockGetUser(mockParentUser);

    mockGetPersonalAccessTokens([]).as('getTokens');
    mockGetAppTokens([]).as('getAppTokens');
    mockCreatePersonalAccessToken(mockParentAccountToken).as('createToken');

    cy.visitWithLogin('/profile/tokens');
    cy.wait(['@getTokens', '@getAppTokens']);

    // Click create button, fill out and submit PAT create form.
    ui.button
      .findByTitle('Create a Personal Access Token')
      .should('be.visible')
      .should('be.enabled')
      .click();

    mockGetPersonalAccessTokens([mockParentAccountToken]).as('getTokens');
    ui.drawer
      .findByTitle('Add Personal Access Token')
      .should('be.visible')
      .within(() => {
        // Confirm that the “Child account access” grant is not visible in the list of permissions.
        cy.findAllByText('Child Account Access').should('not.exist');

        // Specify ALL scopes by selecting the "No Access" Select All radio button.
        cy.get('[data-qa-perm-rw-radio]').click();
        cy.get('[data-qa-perm-rw-radio]').should(
          'have.attr',
          'data-qa-radio',
          'true'
        );

        // Specify a label and re-submit.
        cy.findByLabelText('Label').as('qaLabel').scrollIntoView();
        cy.get('@qaLabel').should('be.visible').should('be.enabled').click();
        cy.focused().type(mockParentAccountToken.label);

        ui.buttonGroup
          .findButtonByTitle('Create Token')
          .scrollIntoView()
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm that PAT secret dialog is shown and close it.
    cy.wait('@createToken');
    ui.dialog
      .findByTitle('Personal Access Token')
      .should('be.visible')
      .within(() => {
        ui.button
          .findByTitle('I Have Saved My Personal Access Token')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm that new PAT is shown in list and "View Scopes" drawer works.
    // Upon clicking “Create Token”, assert that the outgoing API request payload contains "scopes" value as defined in token.
    cy.wait('@getTokens').then((xhr) => {
      const actualTokenData = xhr.response?.body.data;
      const actualTokenScopes = actualTokenData[0].scopes;
      expect(actualTokenScopes).to.equal(mockParentAccountToken.scopes);
    });
  });

  /*
   * Confirm that the “Child account access” grant is visible in the list of permissions.
   * Upon clicking “Create Token”, assert that the outgoing API request payload contains "scopes" value as defined in token.
   */
  it('Token scopes for parent user with unrestricted access', () => {
    mockGetProfile(mockParentProfile);
    mockGetAccount(mockParentAccount);
    mockGetChildAccounts([mockChildAccount]);
    mockGetProfile({ ...mockParentProfile, restricted: false });
    mockGetUser(mockParentUser);

    mockGetPersonalAccessTokens([]).as('getTokens');
    mockGetAppTokens([]).as('getAppTokens');
    mockCreatePersonalAccessToken(mockParentAccountToken).as('createToken');

    cy.visitWithLogin('/profile/tokens');
    cy.wait(['@getTokens', '@getAppTokens']);

    // Click create button, fill out and submit PAT create form.
    ui.button
      .findByTitle('Create a Personal Access Token')
      .should('be.visible')
      .should('be.enabled')
      .click();

    mockGetPersonalAccessTokens([mockParentAccountToken]).as('getTokens');
    ui.drawer
      .findByTitle('Add Personal Access Token')
      .should('be.visible')
      .within(() => {
        // Confirm that the “Child account access” grant is not visible in the list of permissions.
        cy.findAllByText('Child Account Access')
          .as('qaChildAccount')
          .scrollIntoView();
        cy.get('@qaChildAccount').should('be.visible');

        // Specify ALL scopes by selecting the "No Access" Select All radio button.
        cy.get('[data-qa-perm-rw-radio]').click();
        cy.get('[data-qa-perm-rw-radio]').should(
          'have.attr',
          'data-qa-radio',
          'true'
        );

        // Specify a label and re-submit.
        cy.findByLabelText('Label').as('qaLabel').scrollIntoView();
        cy.get('@qaLabel').should('be.visible').should('be.enabled').click();
        cy.focused().type(mockParentAccountToken.label);

        ui.buttonGroup
          .findButtonByTitle('Create Token')
          .scrollIntoView()
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm that PAT secret dialog is shown and close it.
    cy.wait('@createToken');
    ui.dialog
      .findByTitle('Personal Access Token')
      .should('be.visible')
      .within(() => {
        ui.button
          .findByTitle('I Have Saved My Personal Access Token')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm that new PAT is shown in list and "View Scopes" drawer works.
    // Upon clicking “Create Token”, assert that the outgoing API request payload contains "scopes" value as defined in token.
    cy.wait('@getTokens').then((xhr) => {
      const actualTokenData = xhr.response?.body.data;
      const actualTokenScopes = actualTokenData[0].scopes;
      expect(actualTokenScopes).to.equal(mockParentAccountToken.scopes);
    });
  });
});
